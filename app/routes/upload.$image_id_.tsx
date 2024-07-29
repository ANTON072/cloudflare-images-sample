import { ActionFunctionArgs, json, redirect } from "@remix-run/cloudflare";

export async function action({ request, params, context }: ActionFunctionArgs) {
  const env = context.cloudflare.env;
  const method = request.method.toLowerCase();

  if (method === "delete") {
    const imageId = params.image_id;
    if (!imageId) {
      return json({ error: "Image ID is required" }, { status: 400 });
    }
    const {
      CLOUDFLARE_ACCOUNT_ID: accountId,
      CLOUDFLARE_IMAGES_API_TOKEN: apiToken,
    } = env;
    const response = await fetch(
      `https://api.cloudflare.com/client/v4
/accounts/${accountId}/images/v1/${imageId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${apiToken}`,
        },
      },
    );

    if (!response.ok) {
      return json({ error: "Failed to delete image" }, { status: 500 });
    }

    return redirect("/upload");
  }

  return json({ error: "Method not allowed" }, { status: 405 });
}
