#!/usr/bin/env node
const axios = require('axios');
const fs = require('fs');
const config = require('./config.json');
const API = `https://api.github.com/repos/${config.username}/${config.repo}`;
const RepoUrl = `https://github.com/${config.username}/${config.repo}`;
const ANCHOR_NUMBER = 5;

async function getIssues(params) {
  const { data } = await axios.get(`${API}/issues`, {
    params,
  });
  return data;
}

async function getLabels() {
  const { data } = await axios.get(`${API}/labels`);
  return data;
}

// 添加 readme item
function addIssueItemInfo(issue) {
  const time = String(issue['updated_at']).substring(0, 10);
  return `- [${issue.title}](${issue['html_url']}) -- ${time}\n`;
}

function isEmpty(arr) {
  return arr.length === 0;
}

async function updateReadme() {
  try {
    const schedule = fs.readFileSync('./schedule.md');
    const labels = await getLabels();
    let readme = `
# 我的 2021 秋招 

本仓库用于记录自己 2021 年秋招经历，分享秋招经验。

本仓库复刻(fork)自开源仓库： [Mayandev/interview-schedule](https://github.com/Mayandev/interview-schedule)，感谢 Mayandev 的工作。  
仓库使用 [Issues](${RepoUrl}/issues) 进行进度管理，自动同步 [Google Calendar](https://calendar.google.com/) 的面试日程，并由 Github Action 自动生成 MARKDOWN 文档。

通过微软 [Power Automate](https://asia.flow.microsoft.com/zh-cn/) 服务将 Outlook 日程自动同步到 Google Calendar，间接实现同步 Outlook 日程。

*Reference*

- 项目介绍：[巧妙使用 GitHub Issues 管理自己的面试进度](https://www.nowcoder.com/discuss/700084)
- 使用方法：[如何创建自己的面试日程？](https://github.com/Mayandev/interview-2021/issues/19)
- [同步谷歌日历到outlook日历--Power Automate应用](https://zhuanlan.zhihu.com/p/350907659)

---

👇 以下内容由 GitHub Action 自动生成 👇

## 面试日程

${schedule}

`;

    for (let i = 0; i < labels.length; i++) {
      const label = labels[i];
      let partMD = `## ${label.name}\n`;
      const issuesWithLabel = await getIssues({ labels: label.name });
      if (isEmpty(issuesWithLabel)) {
        continue;
      }
      issuesWithLabel.forEach((issue, index) => {
        if (index === ANCHOR_NUMBER) {
          partMD += '<details><summary>显示更多</summary>\n';
          partMD += '\n';
        }
        partMD += addIssueItemInfo(issue);
        if (index === issuesWithLabel.length - 1 && index >= ANCHOR_NUMBER) {
          partMD += '</details>\n';
          partMD += '\n';
        }
      });
      readme += partMD;
    }

    fs.writeFileSync('./README.md', readme, 'utf8');
  } catch (error) {
    console.log(error);
  }
}

updateReadme();
