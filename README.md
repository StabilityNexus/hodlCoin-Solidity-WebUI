Below is the complete Markdown code that you can paste directly into your `README.md`:

```markdown
This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Local Setup with Project ID

Before running the project locally, you need to set up an environment variable with your Project ID. Follow these steps:

1. **Create a `.env` File**  
   In the root directory of the project, create a file named `.env` and add the following line:
   ```env
   NEXT_PUBLIC_PROJECT_ID=your-project-id
   ```

2. **Obtain Your Project ID**  
   To get your `your-project-id` value:
   - Visit [Reown Cloud](https://cloud.reown.com/sign-in).
   - Create an account or log in if you already have one.
   - Create a new project within the dashboard.
   - Once the project is created, locate your project key (this may be labeled as "Project ID" or "API Key").
   - Copy the key and paste it into your `.env` file in place of `your-project-id`.

After setting up the environment variable, you can run the development server as described above.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.


```

Simply copy the above code into your `README.md` file, and it will include both the standard Next.js instructions as well as the steps to set up the Project ID locally.