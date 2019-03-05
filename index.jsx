import base64 from 'base-64';
import { styled } from 'uebersicht';
import * as config from './config.json';

export const refreshFrequency = 1.8e6; // 30m

export const className = `
  left: 2rem;
  top: 2rem;
  color: white;
  font-family: -apple-system;
  z-index: 1;
`;

const IssueList = styled('ul')`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  margin: 0;
  padding: 0.25rem;
  border: 1px solid #999;
  -webkit-border-radius: 5px;
  background-color: rgba(85, 85, 85, 0.7);
  list-style-type: none;
`;

const Item = styled('li')`
  margin: 0.25rem 0;
  display: inline-flex;
  align-items: center;
  justify-content: flex-start;
`;

const Type = styled('img')`
  padding: 0 0.5rem 0 0;
  margin: 0;
`;

const Status = styled('span')`
  padding: 0 0.5rem 0 0;
  margin: 0;
  font-variant: small-caps;
  font-size: 0.5em;
  color: rgba(200, 200, 200, 1.0);
`;

const Key = styled('a')`
  padding: 0 0.5rem 0 0;
  margin: 0;
  color: rgba(200, 200, 200, 1.0);
  text-decoration: none;
`;

const Summary = styled('a')`
  padding: 0 0.5rem 0 0;
  margin: 0;
  color: white;
  text-decoration: none;
`;

const url = new URL(`http://127.0.0.1:41417/https://${config.jira_domain}/rest/api/2/search`);
const params = {
  jql: `filter = ${config.jira_filter}`,
  startAt: 0,
  maxResults: 10,
  fields: [
    'summary',
    'status',
    'issuetype',
  ],
};

url.search = new URLSearchParams(params);

const auth = base64.encode(`${config.username}:${config.password}`);
export const command = dispatch => fetch(url, {
  headers: {
    Authorization: `Basic ${auth}`,
  },
})
  .then((response) => {
    if (response.ok) {
      return response.json();
    }
    return {};
  })
  .then(data => dispatch({ type: 'FETCH_SUCCEEDED', data }));

export const updateState = (event) => {
  if (event.type === 'FETCH_SUCCEEDED') {
    return event.data;
  }
  return {};
};

const Issue = ({
  issuekey,
  summary,
  issuetype,
  status,
}) => {
  const issueLink = `https://${config.jira_domain}/browse/${issuekey}`;
  return (
    <Item>
      <Type src={issuetype.iconUrl} />
      <Key href={issueLink}>{issuekey}</Key>
      <Summary href={issueLink}>{summary}</Summary>
      <Status>{status.name}</Status>
    </Item>
  );
};

/*
Issue.propTypes = {
  issuekey: PropTypes.string.isRequired,
  summary: PropTypes.string.isRequired,
  issuetype: PropTypes.object.isRequired,
  status: PropTypes.object.isRequired
};
*/

export const render = ({ issues = [] }) => (
  <IssueList>
    {issues.map(({ key, fields }, idx) => (<Issue key={idx} issuekey={key} {...fields} />))}
  </IssueList>
);

/*
render.propTypes = {
  issues: PropTypes.arrayOf(PropTypes.Object),
};

render.defaultProps = {
  issues: [],
};
*/
