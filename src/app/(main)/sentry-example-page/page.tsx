"use client";

import Head from "next/head";
import * as Sentry from "@sentry/nextjs";
import { useState, useEffect, useRef } from "react";

// const TestBuggyComponent = () => {
//   const [count, setCount] = useState(0);
//   const loopGuard = useRef(0);
//   useEffect(() => {
//     if (loopGuard.current > 5) {
//       throw new Error("Simulated: Maximum update depth exceeded 🧨");
//     }

//     loopGuard.current += 1;
//     setCount((c) => c + 1);
//   }, [count]);

//   return <div className="bg-red-500 text-3xl text-white">Count: {count}</div>;
// };

export default function Page() {
  // const [triggerBug, setTriggerBug] = useState(false);
  const [hasSentError, setHasSentError] = useState(false);

  return (
    <>
      <div className="h-full w-full">
        <Head>
          <title>sentry-example-page</title>
          <meta
            name="description"
            content="Test Sentry for your Next.js app!"
          />
        </Head>

        <main className="mx-auto flex h-full w-full max-w-[530px] flex-col items-center justify-center text-center text-white">
          <div className="flex-spacer" />
          <svg
            height="40"
            width="40"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="mb-5 scale-125"
          >
            <path
              d="M21.85 2.995a3.698 3.698 0 0 1 1.353 1.354l16.303 28.278a3.703 3.703 0 0 1-1.354 5.053 3.694 3.694 0 0 1-1.848.496h-3.828a31.149 31.149 0 0 0 0-3.09h3.815a.61.61 0 0 0 .537-.917L20.523 5.893a.61.61 0 0 0-1.057 0l-3.739 6.494a28.948 28.948 0 0 1 9.63 10.453 28.988 28.988 0 0 1 3.499 13.78v1.542h-9.852v-1.544a19.106 19.106 0 0 0-2.182-8.85 19.08 19.08 0 0 0-6.032-6.829l-1.85 3.208a15.377 15.377 0 0 1 6.382 12.484v1.542H3.696A3.694 3.694 0 0 1 0 34.473c0-.648.17-1.286.494-1.849l2.33-4.074a8.562 8.562 0 0 1 2.689 1.536L3.158 34.17a.611.611 0 0 0 .538.917h8.448a12.481 12.481 0 0 0-6.037-9.09l-1.344-.772 4.908-8.545 1.344.77a22.16 22.16 0 0 1 7.705 7.444 22.193 22.193 0 0 1 3.316 10.193h3.699a25.892 25.892 0 0 0-3.811-12.033 25.856 25.856 0 0 0-9.046-8.796l-1.344-.772 5.269-9.136a3.698 3.698 0 0 1 3.2-1.849c.648 0 1.285.17 1.847.495Z"
              fill="currentcolor"
            />
          </svg>
          {/* {triggerBug && <TestBuggyComponent />} */}

          {/* <Demo /> */}
          <h1 className="font-geistSemiBold text-5xl">Sentry Example</h1>

          <p className="description">
            Click the button below, and view the sample error on the Sentry{" "}
            <a
              target="_blank"
              href="https://nova-sz.sentry.io/issues/?project=4508983833002064"
            >
              Issues Page
            </a>
            . For more details about setting up Sentry,{" "}
            <a
              target="_blank"
              href="https://docs.sentry.io/platforms/javascript/guides/nextjs/"
            >
              read our docs
            </a>
            .
          </p>

          {/* <button
            type="button"
            className="my-3 rounded-md border border-white px-2 py-1.5"
            onClick={() => setTriggerBug((prev) => !prev)}
          >
            <span>Trigger Error</span>
          </button> */}

          <button
            type="button"
            className="my-3 rounded-md border border-white px-2 py-1.5"
            onClick={() => {
              // Sentry.captureMessage("Example Page: Sentry Example ✨", "fatal");

              // const errorDetails = {
              //   type: "Example",
              //   timestamp: Date.now(),
              // };

              // Sentry.withScope((scope) => {
              //   scope.setExtras(errorDetails);
              //   Sentry.captureException(
              //     new Error(`Error 🔴 - (Chart WS): ${errorDetails.type}`),
              //   );
              // });
              console.error(`Error 🔴 - (GLOBAL TEST)`);
            }}
            // onClick={async () => {
            //   await Sentry.startSpan(
            //     {
            //       name: "Example Frontend Span",
            //       op: "test",
            //       attributes: {
            //         custom: "limited-data",
            //       },
            //     },
            //     async () => {
            //       const res = await fetch("/api/sentry-example-api/hehehe");
            //       if (!res.ok) {
            //         setHasSentError(true);
            //         throw new Error("Sentry Example 🔴");
            //       }
            //     },
            //   );
            // }}
          >
            <span>Throw Sample Error</span>
          </button>

          {hasSentError ? (
            <p className="success">Sample error was sent to Sentry.</p>
          ) : (
            <div className="success_placeholder" />
          )}

          <div className="flex-spacer" />
          <p className="description">
            Adblockers will prevent errors from being sent to Sentry.
          </p>
        </main>
      </div>
    </>
  );
}

import { useQuery } from "@tanstack/react-query";
import * as HoverCard from "@radix-ui/react-hover-card";

const Demo = () => {
  const { isPending, isError, data } = useQuery({
    queryKey: ["posts"],
    queryFn: () =>
      fetch(`https://jsonplaceholder.typicode.com/posts`).then((res) =>
        res.json(),
      ),
  });

  if (isPending) {
    return <div>loading posts...</div>;
  }

  if (isError) {
    return null;
  }

  return (
    <div>
      {/* @ts-ignore */}
      {data.map((post, index) => (
        <DemoItem key={post.id} index={index} />
      ))}
    </div>
  );
};

function DemoItem({ index }: { index: number }) {
  const { isPending, isError, data } = useQuery({
    queryKey: ["posts", index],
    queryFn: () =>
      fetch(`https://jsonplaceholder.typicode.com/posts/${index}`).then((res) =>
        res.json(),
      ),
  });

  if (isPending) {
    return <div>loading...</div>;
  }

  if (isError) {
    return null;
  }

  return (
    <HoverCard.Root>
      <HoverCard.Trigger>
        <button>Button</button>
      </HoverCard.Trigger>
      <HoverCard.Portal>
        <HoverCard.Content>
          <HoverCard.Arrow />
        </HoverCard.Content>
      </HoverCard.Portal>
    </HoverCard.Root>
  );
}
