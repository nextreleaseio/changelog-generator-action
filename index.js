const core = require('@actions/core');
const fs = require('fs');
const { GitHub } = require('@actions/github');

const NEWLINE = ' \n';

async function run() {
  const path = core.getInput('changelog'),
    token = core.getInput('token'),
    usePr = core.getInput('use_pullrequest'),
    defaultBranch = core.getInput('default_branch'),
    ownerRepo = process.env.GITHUB_REPOSITORY,
    eventPath = process.env.GITHUB_EVENT_PATH;

  const [owner, repo] = ownerRepo.split('/');

  if (!token) {
    core.error('Must provide valid `token` parameter.');
  }

  const octokit = new GitHub(token);
  let sha;
  let currentContents = '';
  let changelogExists = true;

  try {
    let { data } = await octokit.repos.getContents({
      owner,
      repo,
      path
    });

    if (data.type !== 'file') {
      core.error(`Your specified changelog ${path}, is not a file`);
    }
    if (data.sha) {
      sha = data.sha;
    }
    let contentBuffer = Buffer.from(data.content, 'base64');
    currentContents = `${contentBuffer.toString('utf8')}`;
  } catch (e) {
    changelogExists = false;
  }

  let { url, tag, name, body, releaseBranch } = getReleaseData(eventPath);

  let branch = defaultBranch || releaseBranch;

  let newContents = `### [${name}](${url}):${NEWLINE} ${body} ${NEWLINE}${currentContents}`;
  let buff = new Buffer.from(newContents);
  let content = buff.toString('base64');

  let options = {
    owner,
    repo,
    path,
    branch,
    message: `Updated ${path} via Next Release action.`,
    content
  };

  if (changelogExists) {
    options.sha = sha;
  }

  let prBranch = core.getInput('branch_name') || `changelog-${tag}`;

  if (usePr) {
    let refSha;
    try {
      let { data } = await octokit.git.getRef({
        owner,
        repo,
        ref: `heads/${branch}`
      });

      refSha = data.object.sha;
    } catch (e) {
      core.error(`Error creating changelog PR ${e}`);
      return;
    }

    try {
      await octokit.git.createRef({
        owner,
        repo,
        sha: refSha,
        ref: `refs/heads/${prBranch}`
      });
      options.branch = prBranch;
    } catch (e) {
      core.error(`Failed creating changelog PR: ${e}`);
      return;
    }
  }

  try {
    await octokit.repos.createOrUpdateFile(options);
  } catch (e) {
    core.error(`Failed updating Changelog: ${e}`);
  }

  if (usePr) {
    await octokit.pulls.create({
      owner,
      repo,
      head: prBranch,
      base: branch,
      title: `Update ${path}`,
      maintainer_can_modify: true,
      body: 'Automatically generated by Next Release Changelog Action'
    });
  }
}

function getReleaseData(eventPath) {
  const event = JSON.parse(fs.readFileSync(eventPath, 'utf8'));

  let {
    html_url: url,
    tag_name: tag,
    name,
    body,
    target_commitish: releaseBranch
  } = event.release;

  return { url, tag, name, body, releaseBranch };
}

run();
