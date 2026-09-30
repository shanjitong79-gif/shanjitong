进口 表达从……起"快速";
进口 CORS从...起"Cors";

Const应用程序=表达();
Const港口=数量(过程.env.港口||3000);
ConstOpenAI_API_KEY=过程.env.OpenAI_API_KEY||"";
ConstOpenAI_MODEL=过程.env.OpenAI_MODEL||"gpt-5.6-月";
Constsystem_PROMPT=
  过程.env.AI_SYSTEM_PROMPT||
  "你是善鸡通AI，一个友好、准确、简洁的中文AI助手.回答问题时尽量直接、有条理；不确定时明确说明。";

应用程序.禁用("X-Power-by");
应用程序.使用(CORS({ 起源: 正确 }));
应用程序.使用(表达.JSON({ 限制: "1mb" }));
应用程序.使用(表达.静态的(".", { 扩展: ["html"] }));

应用程序.得到("/{*splat}", (_req, res)=>{
  res.JSON({
    好的: 正确,
    姓名: "善鸡通AI",
    版本: "1.0.0",
    aiConfigured: 布尔型(OpenAI_API_KEY)
  });
});

功能extractText(数据) {
  如果 (typeof 数据?.输出文本(_T)==="字符串" && 数据.输出文本(_T).修剪()) {
    返回 数据.输出文本(_T).修剪();
  }
  Const部分=[];
  为 (Const项……的数据?.输出||[]) {
    为 (Const内容……的项?.内容||[]) {
      如果 (typeof 内容?.文本==="字符串") 部分.推(内容.文本);
    }
  }
  返回 部分.参与("\n").修剪();
}

app.post("/api/chat", async (req, res) => {
  const incoming = Array.isArray(req.body?.messages) ? req.body.messages : [];
  const messages = incoming
    .filter(
      (m) =>
        m &&
        (m.role === "user" || m.role === "assistant") &&
        typeof m.content === "string"
    )
    .slice(-30)
    .map((m) => ({
      role: m.role,
      content: m.content.slice(0, 12000)
    }));

  if (!messages.length) {
    return res.status(400).json({ error: "请输入消息。" });
  }
  if (messages[messages.length - 1].role !== "user") {
    return res.status(400).json({ error: "最后一条消息必须来自用户。" });
  }
  if (!OPENAI_API_KEY) {
    return res.status(503).json({
      error: "AI 尚未配置。请在 Render 环境变量中设置 OPENAI_API_KEY。"
    });
  }

  try {
    const upstream = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        input: [
          { role: "system", content: SYSTEM_PROMPT },
          ...messages
        ]
      })
    });

    const raw = await upstream.text();
    let data = {};
    try {
      data = JSON.parse(raw);
    } catch {}

    if (!upstream.ok) {
      const detail =
        data?.error?.message ||
        data?.message ||
        `OpenAI 返回 HTTP ${upstream.status}`;
      return res.status(502).json({ error: detail });
    }

    const reply = extractText(data);
    if (!reply) {
      return res.status(502).json({ error: "AI 没有返回有效内容。" });
    }

    return res.json({ reply });
  } catch (error) {
    console.error("OpenAI request failed:", error?.message || error);
    return res.status(502).json({
      error: "无法连接 OpenAI，请检查服务器网络和 API Key。"
    });
  }
});

app.get("*", (_req, res) => {
  res.sendFile(process.cwd() + "/index.html");
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`善鸡通 AI listening on port ${PORT}`);
});
