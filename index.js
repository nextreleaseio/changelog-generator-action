const core = require("@actions/core");
const fs = require('fs');
const { GitHub } = require("@actions/github");

const NEWLINE = " \n ";

async function run() {
  const path = core.getInput("changelog"),
    token = core.getInput("token"),
    ownerRepo = process.env.GITHUB_REPOSITORY,
    eventPath = process.env.GITHUB_EVENT_PATH,
    eventName = process.env.GITHUB_EVENT_NAME;

  const [owner, repo] = ownerRepo.split("/");

  if (!token) {
    core.error("Must provide valid `token` parameter.");
  }

  const octokit = new GitHub(token);
  let sha;
  let currentContents = "";
  let changelogExists = true;

  try {
    let { data } = await octokit.repos.getContents({
      owner,
      repo,
      path
    });

    if (data.type !== "file") {
      core.error(`Your specified changelog ${path}, is not a file`);
    }
    if (data.sha) {
      sha = data.sha;
    }
    currentContents = `${data.contents} ${NEWLINE}`;
  } catch(e) {
    changelogExists = false;
  }


  let { url, tag, name, body } = getReleaseData(eventPath);

  currentContents += `### [${name}](${url}) ${NEWLINE} ${tag} ${NEWLINE} ${body}`;

  let buff = new Buffer.from(currentContents);
  let content = buff.toString("base64");

  let options = {
    owner,
    repo,
    path,
    message: `Updated ${path} via Next Release action.`,
    content
  };

  if (changelogExists) {
    options.sha = sha;
  }

  try {
    await octokit.repos.createOrUpdateFile(options);
  } catch (e) {
    core.error(`Failed updating Changelog: ${e}`);
  }
}

function getReleaseData(eventPath) {
  const event = JSON.parse(fs.readFileSync(eventPath, "utf8"));

  let { html_url: url, tag_name: tag, name, body } = event.release;

  return { url, tag, name, body };
}

run();
