import type { Collection } from "./../typings/index";
import type { CollectionBrief, Rules } from "../typings";

const PREFIX = "http://localhost:8899/whistle.easy-mock/api";

export async function getCollectionsBrief(): Promise<CollectionBrief[]> {
  const res = await fetch(`${PREFIX}/collection`);
  const errMsg = "Failed to get collections brief!";
  if (!res.ok) {
    throw new Error(`Server Error: ${errMsg}`);
  }
  const { code, msg, data } = await res.json();
  if (code) {
    console.error(msg);
    throw new Error(errMsg);
  }
  return data;
}

export async function createCollection(brief: CollectionBrief) {
  const res = await fetch(`${PREFIX}/collection`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(brief),
  });

  const errMsg = "Failed to create collection";
  if (!res.ok) {
    throw new Error(`Server Error: ${errMsg}`);
  }
  const { code, msg } = await res.json();
  if (code) {
    console.error(msg);
    throw new Error(errMsg);
  }
}

export async function deleteCollection(id: string) {
  const res = await fetch(`${PREFIX}/collection/${id}`, {
    method: "DELETE",
  });
  const errMsg = "Failed to delete collection";
  if (!res.ok) {
    throw new Error(`Server Error: ${errMsg}`);
  }
  const { code, msg } = await res.json();
  if (code) {
    console.error(msg);
    throw new Error(errMsg);
  }
}

export async function getCollection(id: string): Promise<Collection> {
  const res = await fetch(`${PREFIX}/collection/${id}`);
  const errMsg = "Failed to get collection!";
  if (!res.ok) {
    throw new Error(`Server Error: ${errMsg}`);
  }
  const { code, msg, data } = await res.json();
  if (code) {
    console.error(msg);
    throw new Error(errMsg);
  }
  return data;
}

export async function saveCollection(
  id: string,
  rules: Rules,
  isDelete = false
) {
  const res = await fetch(`${PREFIX}/collection/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(rules),
  });

  const errMsg = isDelete ? "Failed to delete!" : "Failed to save!";

  if (!res.ok) {
    throw new Error(`Server Error: ${errMsg}`);
  }
  const { code, msg } = await res.json();
  if (code) {
    console.error(msg);
    throw new Error(errMsg);
  }
}
