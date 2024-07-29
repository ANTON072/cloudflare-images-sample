import { Form, json, useActionData, useLoaderData } from "@remix-run/react";
import {
  unstable_composeUploadHandlers as composeUploadHandlers,
  unstable_createMemoryUploadHandler as createMemoryUploadHandler,
  unstable_parseMultipartFormData as parseMultipartFormData,
} from "@remix-run/cloudflare";

import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/cloudflare";
import { cfImagesUploadHandler } from "~/utils/cfImagesUploadHandler";

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    {
      name: "description",
      content: "Welcome to Remix on Cloudflare!",
    },
  ];
};

export async function loader({ context }: LoaderFunctionArgs) {
  const env = context.cloudflare.env;

  return json({
    env: {
      CF_IMAGE_BASE_URL: env.CLOUDFLARE_IMAGE_BASE_URL,
    },
  });
}

export async function action({ request, context }: ActionFunctionArgs) {
  const env = context.cloudflare.env;

  const uploadHandler = composeUploadHandlers(
    async ({ name, filename, data, contentType }) => {
      if (name !== "image") return undefined;
      const cfImage = await cfImagesUploadHandler({
        data,
        filename,
        contentType,
        cfAccountId: env.CLOUDFLARE_ACCOUNT_ID,
        cfApiToken: env.CLOUDFLARE_IMAGES_API_TOKEN,
      });

      return cfImage.result.id;
    },
    createMemoryUploadHandler(),
  );

  const formData = await parseMultipartFormData(request, uploadHandler);
  const name = formData.get("name") as string;
  const image = formData.get("image");

  return json({ name, image });
}

export default function Upload() {
  const loaderData = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  return (
    <div className="font-sans p-4 max-w-xl">
      <h1 className="text-3xl mb-5">Cloudflare Images Sample.</h1>
      {actionData?.name && <h2>{actionData.name}</h2>}
      {actionData?.image && (
        <div>
          <div>
            <img
              src={`${loaderData.env.CF_IMAGE_BASE_URL}/${actionData?.image}/public`}
              alt=""
            />
          </div>
          <Form method="delete">
            <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
              Delete
            </button>
          </Form>
        </div>
      )}
      <Form
        method="post"
        encType="multipart/form-data"
        className="flex flex-col space-y-5"
      >
        <label>
          <span>Name</span>
          <input type="text" name="name" className="block mt-1 w-full" />
        </label>
        <label>
          <span>Image File</span>
          <input
            type="file"
            name="image"
            className="block mt-1 w-full"
            accept="image/*"
          />
        </label>
        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Submit
        </button>
      </Form>
    </div>
  );
}
