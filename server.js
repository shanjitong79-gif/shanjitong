import express from "express";
import cors from "cors";

const app = express();

const PORT = Number(process.env.PORT || 3000);
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || "";
const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-5.6-luna";

const SYSTEM_PROMPT =
  process.env.AI_SYSTEM_PROMPT ||
  "你是善鸡通 AI，一个友好、准确、简洁的中文 AI 助手。回答问题时尽量直接、有条理；不确定时明确说明。";

app.disable("x-powered-by");

app.use(cors({ origin: true }));

app.use(express.json({ limit: "1mb" }));

app.use(express.static(".", { extensions: ["html"] }));

// 健康检查
app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    name: "善鸡通 AI",
    version: "1.0.0",
    aiConfigured: Boolean(OPENAI_API_KEY)
  });
});

// 提取 OpenAI Responses API 返回的文本
function extractText(data) {
  if (
    typeof data?.output_text === "string" &&
    data.output_text.trim()
  ) {
    return data.output_text.trim();
  }

  const parts = [];

  for (const item of data?.output || []) {
    for (const content of item?.content || []) {
      if (typeof content?.text === "string") {
        parts.push(content.text);
      }
    }
  }

  return parts.join("\n").trim();
}

// AI 对话接口
app.post("/api/chat", async (req, res) => {
  const incoming = Array.isArray(req.body?.messages)
    ? req.body.messages
    : [];

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
    return res.status(400).json({
      error: "请输入消息。"
    });
  }

  if (messages[messages.length - 1].role !== "user") {
    return res.status(400).json({
      error: "最后一条消息必须来自用户。"
    });
  }

  if (!OPENAI_API_KEY) {
    return res.status(503).json({
      error:
        "AI 尚未配置。请在 Render 环境变量中设置 OPENAI_API_KEY。"
    });
  }

  try {
    const upstream = await fetch(
      "https://api.openai.com/v1/responses",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: OPENAI_MODEL,
          input: [
            {
              role: "system",
              content: SYSTEM_PROMPT
            },
            ...messages
          ]
        })
      }
    );

    const raw = await upstream.text();

    let data = {};

    try {
      data = JSON.parse(raw);
    } catch {
      // OpenAI 返回的内容不是 JSON 时保持空对象
    }

    if (!upstream.ok) {
      const detail =
        data?.error?.message ||
        data?.message ||
        `OpenAI 返回 HTTP ${upstream.status}`;

      return res.status(502).json({
        error: detail
      });
    }

    const reply = extractText(data);

    if (!reply) {
      return res.status(502).json({
        error: "AI 没有返回有效内容。"
      });
    }

    return res.json({
      reply
    });
  } catch (error) {
    console.error(
      "OpenAI request failed:",
      error?.message || error
    );

    return res.status(502).json({
      error:
        "无法连接 OpenAI，请检查服务器网络和 API Key。"
    });
  }
});

// Express 5 正确的通配路由写法
app.get("/{*splat}", (_req, res) => {
  res.sendFile(process.cwd() + "/index.html");
});

// 启动服务器
app.listen(PORT, "0.0.0.0", () => {
  console.log(
    `善鸡通 AI listening on port ${PORT}`
  );
});
