const mongoose = require("../db/db");

const CodeSchema = mongoose.Schema(
    {
        mobile: {
            type: Number,
            required: true,
            unique: true,
        },
        code: {
            type: Number,
            required: true,
        }
    },
    {
        timestamps: true,
    }
);

const Code = mongoose.model("code", CodeSchema);
module.exports = Code;
