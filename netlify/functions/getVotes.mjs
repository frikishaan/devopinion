import { getStore } from "@netlify/blobs";
import { questions } from "@/data/data";

export default async (req, context) => {
  const store = getStore("questions");

  var resp = [];

  for (let i = 0; i < questions.length; i++) {
    let blob = await store.get(questions[i].key, {
      type: "json",
    });

    if (!blob) {
      await store.setJSON(questions[i].key, [1, 1]);
      blob = [1, 1];
    }

    resp.push({
      key: questions[i].key,
      votes: blob,
      totalVotes: blob[0] + blob[1],
    });
  }

  return Response.json({
    questions: resp,
  });
};
