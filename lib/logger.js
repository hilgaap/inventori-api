export async function withLogging(request, label, handler) {
  const start = Date.now();
  const url = request.nextUrl?.pathname || "";

  try {
    const response = await handler();
    const time = Date.now() - start;

    console.log(`[LOG] [${label}] ${request.method} ${url} - ${time}ms`);
    return response;
  } catch (error) {
    const time = Date.now() - start;
    console.error(
      `[ERROR] [${label}] ${request.method} ${url} - ${time}ms`,
      error
    );
    throw error;
  }
}
