import type { Rules } from '../typings';

const PREFIX = '/whistle.easy-mock/api';

export async function getRuleList(): Promise<Rules> {
  const res = await fetch(`${PREFIX}/rules`);
  const { code, msg, data } = await res.json();
  if (code) {
    console.error(msg);
    throw new Error('Failed to get rules!');
  }
  return data;
}

export async function saveRuleList(rules: Rules, isDelete = false) {
  const res = await fetch(`${PREFIX}/rules`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(rules),
  });

  const errMsg = isDelete ? 'Failed to delete!' : 'Failed to save!';

  if (!res.ok) {
    throw new Error(errMsg);
  }
  const { code, msg } = await res.json();
  if (code) {
    throw new Error(errMsg);
  }
}
