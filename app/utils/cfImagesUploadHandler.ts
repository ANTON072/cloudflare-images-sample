interface Args {
  data: AsyncIterable<Uint8Array>;
  filename?: string;
  contentType: string;
  cfAccountId: string;
  cfApiToken: string;
}

interface ImageResult {
  filename: string;
  id: string;
  meta: {
    [key: string]: string;
  };
  requireSignedURLs: boolean;
  uploaded: string;
  variants: string[];
}

interface ApiResponse {
  errors: unknown[];
  messages: unknown[];
  result: ImageResult;
  success: boolean;
}

export const cfImagesUploadHandler = async ({
  data,
  filename,
  contentType,
  cfAccountId,
  cfApiToken,
}: Args) => {
  // AsyncIterable<Uint8Array> を Blob に変換
  const chunks = [];
  for await (const chunk of data) {
    chunks.push(chunk);
  }
  const blob = new Blob(chunks, { type: contentType });
  const formData = new FormData();
  formData.append("file", blob, filename);

  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${cfAccountId}/images/v1`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${cfApiToken}`,
      },
      body: formData,
    },
  );

  if (!response.ok) {
    throw new Error(`Upload failed: ${response.statusText}`);
  }

  return (await response.json()) as ApiResponse;
};
