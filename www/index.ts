// Stuurt alles van www.martijndenbesten.com permanent door naar het hoofddomein,
// met behoud van pad en querystring.
export default {
  fetch(request: Request): Response {
    const url = new URL(request.url);
    const target = `https://martijndenbesten.com${url.pathname}${url.search}`;
    return new Response(null, {
      status: 301,
      headers: { Location: target, "Cache-Control": "public, max-age=86400" },
    });
  },
};
