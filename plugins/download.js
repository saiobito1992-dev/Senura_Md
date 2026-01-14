const { cmd } = require("../command");
const axios = require("axios");
const mimes = require("mime-types");

cmd(
  {
    pattern: "download",
    alias: ["direct", "dl"],
    desc: "Download files with reactions and better naming",
    category: "download",
    filename: __filename,
  },
  async (bot, mek, m, { from, q, reply }) => {
    try {
      if (!q) return reply("🔗 කරුණාකර සෘජු ලින්ක් එකක් ලබා දෙන්න.");

      const isUrl = /^(https?:\/\/[^\s]+)/i.test(q);
      if (!isUrl) return reply("❌ මෙය වලංගු ලින්ක් එකක් නොවේ.");

      // 1. Reaction එකක් එකතු කිරීම
      await bot.sendMessage(from, { react: { text: "⏳", key: mek.key } });

      // Headers ලබා ගැනීම
      const response = await axios.head(q);
      const mimeType = response.headers["content-type"];
      const fileSize = response.headers["content-length"];

      if (fileSize > 2000 * 1024 * 1024) {
        await bot.sendMessage(from, { react: { text: "❌", key: mek.key } });
        return reply("❌ ගොනුව 2GB ට වඩා වැඩියි.");
      }

      // 2. File Extension එක නිවැරදිව හදාගැනීම
      let extension = mimes.extension(mimeType) || "bin";
      let fileName = q.split("/").pop().split("?")[0] || "file";
      
      // නමේ අගට extension එක නැත්නම් එකතු කිරීම
      if (!fileName.endsWith(`.${extension}`)) {
        fileName = `${fileName}.${extension}`;
      }

      // ෆයිල් එක යැවීම
      await bot.sendMessage(
        from,
        {
          document: { url: q },
          mimetype: mimeType,
          fileName: fileName,
          caption: `✅ *Download Success*\n\n📂 *File:* ${fileName}\n⚖️ *Size:* ${(fileSize / (1024 * 1024)).toFixed(2)} MB`,
        },
        { quoted: mek }
      );

      // 3. සාර්ථක වූ පසු Reaction එක වෙනස් කිරීම
      await bot.sendMessage(from, { react: { text: "✅", key: mek.key } });

    } catch (e) {
      console.log("DOWNLOAD ERROR:", e);
      await bot.sendMessage(from, { react: { text: "❌", key: mek.key } });
      reply("❌ දෝෂයක් සිදු විය. ලින්ක් එක පරීක්ෂා කරන්න.");
    }
  }
);
