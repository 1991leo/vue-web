import fs from "fs"
let c = fs.readFileSync("f:/cpp/dsp_web/src/views/system/company_manage/index.vue", "utf8")

const regex = /<\/el-tooltip>4465205859373[\s\S]*?<\/svg>\s*<\/el-button>\s*<\/el-tooltip>/
c = c.replace(regex, "</el-tooltip>")

fs.writeFileSync("f:/cpp/dsp_web/src/views/system/company_manage/index.vue", c)
