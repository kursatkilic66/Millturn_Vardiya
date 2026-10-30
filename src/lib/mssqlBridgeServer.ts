import http from "http";
import { execFile } from "child_process";

const PORT = 3099;
const ALLOWED_TABLES = new Set(["employees", "shifts", "vehicles"]);

interface DbRequest {
  table: "employees" | "shifts" | "vehicles";
  action: "list" | "add" | "set" | "update" | "delete";
  id?: string;
  data?: Record<string, unknown>;
}

/**
 * Parametreli ADO.NET SqlCommand ile yerel .\SQLEXPRESS VardiyaDb üzerinde
 * güvenli (SQL Injection korumalı) işlem çalıştırır.
 */
function runMssqlOperation(req: DbRequest): Promise<unknown> {
  return new Promise((resolve, reject) => {
    if (!ALLOWED_TABLES.has(req.table)) {
      reject(new Error("Geçersiz tablo adı"));
      return;
    }

    const payloadBase64 = Buffer.from(JSON.stringify(req), "utf8").toString("base64");

    const psScript = `
$ErrorActionPreference = 'Stop'
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$json = [System.Text.Encoding]::UTF8.GetString([System.Convert]::FromBase64String('${payloadBase64}'))
$req = $json | ConvertFrom-Json
$table = $req.table
$action = $req.action

$conn = New-Object System.Data.SqlClient.SqlConnection("Server=.\\SQLEXPRESS;Database=VardiyaDb;Integrated Security=True;TrustServerCertificate=True;")
$conn.Open()
try {
  if ($action -eq 'list') {
    $cmd = $conn.CreateCommand()
    $cmd.CommandText = "SELECT DocId, DataJson FROM [$table]"
    $reader = $cmd.ExecuteReader()
    $items = New-Object System.Collections.ArrayList
    while ($reader.Read()) {
      $null = $items.Add(@{ DocId = $reader.GetString(0); DataJson = $reader.GetString(1) })
    }
    $reader.Close()
    Write-Output (ConvertTo-Json -InputObject @($items) -Compress -Depth 20)
  }
  elseif ($action -eq 'add') {
    $docId = $req.id
    $dataJson = ConvertTo-Json -InputObject $req.data -Compress -Depth 20
    $cmd = $conn.CreateCommand()
    $cmd.CommandText = "INSERT INTO [$table] (DocId, DataJson) VALUES (@id, @json)"
    [void]$cmd.Parameters.AddWithValue("@id", [string]$docId)
    [void]$cmd.Parameters.AddWithValue("@json", [string]$dataJson)
    [void]$cmd.ExecuteNonQuery()
    Write-Output (ConvertTo-Json -InputObject @{ id = $docId } -Compress)
  }
  elseif ($action -eq 'set' -or $action -eq 'update') {
    $docId = [string]$req.id
    $selectCmd = $conn.CreateCommand()
    $selectCmd.CommandText = "SELECT DataJson FROM [$table] WHERE DocId = @id"
    [void]$selectCmd.Parameters.AddWithValue("@id", $docId)
    $existingRaw = $selectCmd.ExecuteScalar()

    $dataJson = ConvertTo-Json -InputObject $req.data -Compress -Depth 20

    if ($null -ne $existingRaw) {
      $updCmd = $conn.CreateCommand()
      $updCmd.CommandText = "UPDATE [$table] SET DataJson = @json WHERE DocId = @id"
      [void]$updCmd.Parameters.AddWithValue("@id", $docId)
      [void]$updCmd.Parameters.AddWithValue("@json", [string]$dataJson)
      [void]$updCmd.ExecuteNonQuery()
    } else {
      $insCmd = $conn.CreateCommand()
      $insCmd.CommandText = "INSERT INTO [$table] (DocId, DataJson) VALUES (@id, @json)"
      [void]$insCmd.Parameters.AddWithValue("@id", $docId)
      [void]$insCmd.Parameters.AddWithValue("@json", [string]$dataJson)
      [void]$insCmd.ExecuteNonQuery()
    }
    Write-Output (ConvertTo-Json -InputObject @{ id = $docId; ok = $true } -Compress)
  }
  elseif ($action -eq 'delete') {
    $docId = [string]$req.id
    $delCmd = $conn.CreateCommand()
    $delCmd.CommandText = "DELETE FROM [$table] WHERE DocId = @id"
    [void]$delCmd.Parameters.AddWithValue("@id", $docId)
    [void]$delCmd.ExecuteNonQuery()
    Write-Output (ConvertTo-Json -InputObject @{ id = $docId; deleted = $true } -Compress)
  }
} finally {
  $conn.Close()
}
`;

    execFile(
      "powershell.exe",
      ["-NoProfile", "-NoLogo", "-Command", psScript],
      { maxBuffer: 20 * 1024 * 1024 },
      (error, stdout, stderr) => {
        if (error) {
          reject(new Error(stderr || error.message));
          return;
        }
        const trimmed = stdout.trim();
        if (!trimmed) {
          resolve([]);
          return;
        }
        try {
          resolve(JSON.parse(trimmed));
        } catch (parseErr) {
          reject(parseErr);
        }
      },
    );
  });
}

let serverStarted = false;

export function startMssqlBridgeServer() {
  if (serverStarted) return;
  serverStarted = true;

  const server = http.createServer(async (req, res) => {
    res.setHeader("Content-Type", "application/json; charset=utf-8");

    if (req.method !== "POST") {
      res.statusCode = 405;
      res.end(JSON.stringify({ error: "Method not allowed" }));
      return;
    }

    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
    });

    req.on("end", async () => {
      try {
        const parsed = JSON.parse(body) as DbRequest;

        if (parsed.action === "update" && parsed.id && parsed.data) {
          // Mevcut kaydı çekip patch ile birleştir
          const list = (await runMssqlOperation({
            table: parsed.table,
            action: "list",
          })) as { DocId: string; DataJson: string }[];
          const found = Array.isArray(list)
            ? list.find((item) => item.DocId === parsed.id)
            : undefined;
          const existingObj = found ? JSON.parse(found.DataJson) : {};
          parsed.data = { ...existingObj, ...parsed.data };
        }

        const result = await runMssqlOperation(parsed);
        res.statusCode = 200;
        res.end(JSON.stringify({ ok: true, result }));
      } catch (err) {
        console.error("[VardiyaDb MSSQL Hatası]:", err);
        res.statusCode = 500;
        res.end(
          JSON.stringify({
            ok: false,
            error: err instanceof Error ? err.message : "MSSQL hatası",
          }),
        );
      }
    });
  });

  server.on("error", (err: NodeJS.ErrnoException) => {
    if (err.code === "EADDRINUSE") {
      // Zaten çalışıyor
      return;
    }
    console.error("[VardiyaDb MSSQL Sunucu Hatası]:", err);
  });

  server.listen(PORT, "127.0.0.1", () => {
    console.log(
      `[VardiyaDb] Yerel MSSQL test köprüsü aktif (127.0.0.1:${PORT} -> .\\SQLEXPRESS / VardiyaDb)`,
    );
  });
}
