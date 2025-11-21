import React from "react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import BookOverview from "@/components/BookOverview";
import BookVideo from "@/components/BookVideo";
import dummyBooks from "../../../../dummybooks.json";
import BookCover from "@/components/BookCover";

const Page = async ({ params }: { params: Promise<{ id: string }> }) => {
  const id = (await params).id;
  const session = await auth();

  // Fetch data from dummybooks.json
  const bookDetails = (dummyBooks as any[]).find((b) => b.id === id) as
    | Book
    | undefined;

  if (!bookDetails) redirect("/404");

  return (
    <>
      <BookOverview {...bookDetails} userId={session?.user?.id as string} />

      <div className="book-details">
        <div className="flex-[1.5]">
          <section className="flex flex-col gap-7">
            <h3>Video</h3>

            <BookVideo videoUrl={bookDetails.videoUrl} />
          </section>
          <section className="mt-10 flex flex-col gap-7">
            <h3>Summary</h3>

            <div className="space-y-5 text-xl text-light-100">
              {bookDetails.summary.split("\n").map((line, i) => (
                <p key={i}>{line}</p>
              ))}
            </div>
          </section>
        </div>

        <aside className="flex-1">
          <h3>More similar books</h3>
          <ul className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
            {(dummyBooks as any[])
              .filter((b) => b.id !== bookDetails.id && b.genre === bookDetails.genre)
              .slice(0, 6)
              .map((b) => (
                <li key={b.id}>
                  <div className="w-full">
                    {/* reuse BookCover for consistent look */}
                    <div className="mx-auto w-28">
                      <BookCover
                        coverColor={b.coverColor}
                        coverImage={b.coverUrl}
                        variant="regular"
                      />
                    </div>
                    <p className="mt-2 line-clamp-1 text-sm text-white">{b.title}</p>
                  </div>
                </li>
              ))}
          </ul>
        </aside>
      </div>
    </>
  );
};
export default Page;
