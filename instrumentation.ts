export async function register() {
  if (
    process.env.NODE_ENV === "development" &&
    process.env.NEXT_RUNTIME === "nodejs"
  ) {
    const { startMssqlBridgeServer } = await import(
      "./src/lib/mssqlBridgeServer"
    );
    startMssqlBridgeServer();
  }
}
