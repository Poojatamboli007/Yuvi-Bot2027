const axios = require("axios");
const fs = require("fs");

module.exports = async function handleCommands({
  api, event, args, cmd, idNum, OWNER_ID, lockedNicknames, activeTargets1, activeTargets2, input
}) {
  const { threadID, senderID } = event;
  if (senderID !== OWNER_ID) return;

  // ==========================================
  // --- SIRF ID 1 YE COMMANDS SUNEGI ---
  // ==========================================
  if (idNum === 1) {
    
    // 1. DP LOCK
    if (cmd === "dplock") {
      if (!args[0]) return api.sendMessage("❌ Image Link do!", threadID);
      global.dpLockLink[threadID] = args[0];
      try {
        const res = await axios.get(args[0], { responseType: "arraybuffer" });
        const path = `./cache/lock_${threadID}.jpg`;
        fs.writeFileSync(path, Buffer.from(res.data));
        api.changeGroupImage(fs.createReadStream(path), threadID, (err) => {
          if (fs.existsSync(path)) fs.unlinkSync(path);
          if (err) return api.sendMessage("❌ DP Change Error!", threadID);
          api.sendMessage("🔒 Group DP Locked Successfully 🔥", threadID);
        });
      } catch (e) { 
        api.sendMessage("❌ Invalid Link or Network Error!", threadID); 
      }
    }

    // 2. NAME LOCK
    if (cmd === "namelock") {
      let targetName = input.trim();

      if (targetName) {
        global.groupNameLock[threadID] = targetName;
        api.setTitle(targetName, threadID, (err) => {
          if (err) return api.sendMessage("❌ Name Set karne mein error aaya!", threadID);
          api.sendMessage(`🔒 Group Name Set & Locked: "${targetName}"\n(Koi bhi change karega to wapas yahi name ho jayega)`, threadID);
        });
      } 
      else {
        api.getThreadInfo(threadID, (err, info) => {
          if (err || !info) return api.sendMessage("❌ Group Info Fetch Error!", threadID);
          global.groupNameLock[threadID] = info.threadName;
          api.sendMessage(`🔒 Current Group Name Locked: "${info.threadName}"\n(Admin/Member Revert Active)`, threadID);
        });
      }
    }

    // 3. UNLOCK NAME
    if (cmd === "unlockname") {
      if (global.groupNameLock[threadID]) {
        delete global.groupNameLock[threadID];
        api.sendMessage("🔓 Group Name Unlocked!", threadID);
      } else {
        api.sendMessage("⚠️ Pehle se koi Name Lock nahi hai!", threadID);
      }
    }

    // 4. NICKNAME LOCK
    if (cmd === "locknick") {
      api.getThreadInfo(threadID, (err, info) => {
        if (err || !info) return api.sendMessage("❌ Info Fetch Error!", threadID);
        global.nicknameLockStatus[threadID] = true;
        global.lockedNicknames[threadID] = info.nicknames || {};
        api.sendMessage("🔒 All Nicknames Locked by ID 1!", threadID);
      });
    }

    // 5. SETALL NICKNAME
    if (cmd === "setall") {
      if (!input) return api.sendMessage("❌ Naam likho!", threadID);
      api.getThreadInfo(threadID, (err, info) => {
        if (err || !info) return api.sendMessage("❌ Info Fetch Error!", threadID);
        api.sendMessage(`⏳ Setting all members nickname to: ${input}...`, threadID);
        info.participantIDs.forEach((id, i) => {
          setTimeout(() => { api.changeNickname(input, threadID, id, () => {}); }, i * 3000);
        });
      });
    }

    // FIGHT: TARGET 1
    if (cmd === "target1") {
      let tID = event.messageReply ? event.messageReply.senderID : args[0];
      if (tID) {
        if (activeTargets1.has(tID)) {
            activeTargets1.delete(tID);
            api.sendMessage("⚪ ID 1 Fight OFF", threadID);
        } else {
            activeTargets1.add(tID);
            api.sendMessage("🎯 ID 1 Fight ON!", threadID);
        }
      } else {
        api.sendMessage("❌ Target ke message par reply karo ya UID do!", threadID);
      }
    }
  }

  // ==========================================
  // --- ID 2: SIRF FIGHT KAREGI ---
  // ==========================================
  if (idNum === 2) {
    if (cmd === "target2") {
      let tID = event.messageReply ? event.messageReply.senderID : args[0];
      if (tID) {
        if (activeTargets2.has(tID)) {
            activeTargets2.delete(tID);
            api.sendMessage("⚪ ID 2 Fight OFF", threadID);
        } else {
            activeTargets2.add(tID);
            api.sendMessage("🎯 ID 2 Fight ON!", threadID);
        }
      } else {
        api.sendMessage("❌ Target ke message par reply karo ya UID do!", threadID);
      }
    }
  }
};
