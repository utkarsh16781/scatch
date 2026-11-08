require("dns").setServers(["8.8.8.8", "1.1.1.1"]);
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const Owner = require("../models/owners");

const [fullname, email, password] = process.argv.slice(2);

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, { dbName: "scatch" });

    if (await Owner.countDocuments()) {
      console.log("Owner already exists");
    } else {
      await Owner.create({
        fullname,
        email: email.toLowerCase(),
        password: await bcrypt.hash(password, 10)
      });
      console.log("Owner created");
    }
  } catch (err) {
    console.error(err);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
})();
