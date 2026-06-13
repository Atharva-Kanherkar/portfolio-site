const prerender = false;
const POST = async ({ request }) => {
  {
    return new Response(JSON.stringify({ error: "Chat is not configured yet." }), {
      status: 503,
      headers: { "Content-Type": "application/json" }
    });
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  POST,
  prerender
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
