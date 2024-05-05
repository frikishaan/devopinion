import { getStore } from "@netlify/blobs";

export default async (req, context) => {
  let request = await req.json();

  // validate
  if (![0, 1].includes(request.option)) {
    return;
  }

  const questions = getStore("questions");
  let blob = await questions.get(request.key, {
    type: "json",
  });

  blob[request.option] += 1;

  await questions.setJSON(request.key, blob);

  return Response.json({
    blob: blob,
    status: 201,
  });
};

export const config = {
  method: "POST",
};
