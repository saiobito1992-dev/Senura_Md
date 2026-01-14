const { cmd } = require("../command");
const axios = require("axios");

cmd(
  {
    pattern: "download",
    alias: ["direct", "dl"],
    desc: "Download files from a direct link",
    category: "download",
    filename: __filename,
  },
  async (bot, mek, m, { from, q, reply }) => {
    try {
      if (!q) return reply("🔗 කරුණාකර සෘජු බාගත කිරීමේ ලින්ක් එකක් ලබා දෙන්න. (Please provide a direct link)");

      // URL එකක්දැයි පරීක්ෂා කිරීම
      const isUrl = /^(https?:\/\/[^\s]+)/i.test(q);
      if (!isUrl) return reply("❌ මෙය වලංගු ලින්ක් එකක් නොවේ.");

      reply("⬇️ බාගත වෙමින් පවතී... (Downloading...)");

      // ලින්ක් එකේ තොරතුරු පරීක්ෂා කිරීම (Headers)
      const response = await axios.head(q);
      const mimeType = response.headers["content-type"];
      const fileSize = response.headers["content-length"];

      // ෆයිල් එක විශාල වැඩිනම් (උදා: 100MB ට වැඩි නම්)
      if (fileSize > 100 * 1024 * 1024) {
        return reply("❌ ගොනුව ඉතා විශාලයි (100MB ට වැඩි). මට මෙය එවිය නොහැක.");
      }

      // ලින්ක් එකෙන් ෆයිල් එකේ නම ලබා ගැනීම
      const fileName = q.split("/").pop().split("?")[0] || "file";

      // පණිවිඩය යැවීම
      await bot.sendMessage(
        from,
        {
          document: { url: q },
          mimetype: mimeType,
          fileName: fileName,
          caption: `✅ *Downloaded Successfully*\n\n📂 *File:* ${fileName}\n📑 *Type:* ${mimeType}`,
        },
        { quoted: mek }
      );

    } catch (e) {
      console.log("DOWNLOAD ERROR:", e);
      reply("❌ බාගත කිරීමේදී දෝෂයක් සිදු විය. කරුණාකර ලින්ක් එක නිවැරදිදැයි පරීක්ෂා කරන්න.");
    }
  }
);
