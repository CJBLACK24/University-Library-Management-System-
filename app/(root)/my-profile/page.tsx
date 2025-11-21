import React from "react";
import Image from "next/image";
import { auth } from "@/auth";
import { db } from "@/database/drizzle";
import { books, borrowRecords, users } from "@/database/schema";
import { eq } from "drizzle-orm";
import BookCard from "@/components/BookCard";
import AvatarUpload from "@/components/AvatarUpload";
import DownloadReceiptButton from "@/components/DownloadReceiptButton";
import config from "@/lib/config";

const Page = async () => {
  const session = await auth();

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, session?.user?.id as string))
    .limit(1);

  // Fetch current borrow records; join with books
  const userBorrows = await db
    .select({
      id: books.id,
      title: books.title,
      author: books.author,
      genre: books.genre,
      rating: books.rating,
      totalCopies: books.totalCopies,
      availableCopies: books.availableCopies,
      description: books.description,
      coverColor: books.coverColor,
      coverUrl: books.coverUrl,
      videoUrl: books.videoUrl,
      summary: books.summary,
      createdAt: books.createdAt,
      borrowRecordId: borrowRecords.id,
      borrowDate: borrowRecords.borrowDate,
      dueDate: borrowRecords.dueDate,
      returnDate: borrowRecords.returnDate,
      status: borrowRecords.status,
    })
    .from(borrowRecords)
    .where(eq(borrowRecords.userId, session?.user?.id as string))
    .innerJoin(books, eq(borrowRecords.bookId, books.id));

  return (
    <div className="grid grid-cols-1 items-start gap-[50px] md:grid-cols-[700px_1fr] lg:grid-cols-[650px_1fr] xl:grid-cols-[600px_1fr]">
      <section className="relative w-full max-w-[800px] rounded-2xl bg-dark-300 p-[50px] shadow md:justify-self-start h-50">
        {/* top ribbon/notch */}
        <div className="absolute -top-5 left-1/2 h-[50px] w-[59px] -translate-x-1/2 rounded-b-xl bg-dark-600" />

        {/* identity row */}
        <div className="flex items-center gap-4">
          <AvatarUpload userId={session?.user?.id as string} userName={user?.fullName || "User"} avatarUrl={user?.image || null} />
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-dark-600 px-3 py-1 text-xs text-light-100">
                <span className="inline-block size-1.5 rounded-full bg-blue-100" />
                Verified Student
              </span>
            </div>
            <h2 className="mt-1 text-[1.575rem] font-semibold text-white">
              {user?.fullName}
            </h2>
            <p className="text-sm text-light-400">{user?.email}</p>
          </div>
        </div>

        {/* meta */}
        <div className="mt-8 space-y-5">
          <div>
            <p className="text-sm text-light-500">University</p>
            <p className="text-base font-semibold text-light-400">Western Institute of Technology</p>
          </div>
          <div>
            <p className="text-sm text-light-500">Student ID</p>
            <p className="text-base font-semibold text-light-400">{user?.universityId}</p>
          </div>
        </div>

        {/* university card */}
        <div className="mt-8">
          <div className="relative w-full overflow-hidden rounded-md">
            {user?.universityCard ? (
              <Image
                src={
                  user.universityCard.startsWith("http")
                    ? user.universityCard
                    : `${config.env.imagekit.urlEndpoint}/${user.universityCard.replace(
                        /^\/+/,
                        "",
                      )}`
                }
                alt="University Card"
                width={800}
                height={600}
                className="h-auto w-full object-contain"
                priority
                unoptimized
              />
            ) : (
              <div className="flex h-64 w-full items-center justify-center rounded-md bg-dark-600 text-sm text-light-400">
                No university ID uploaded yet
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="w-full md:justify-self-end md:max-w-none">
        <h2 className="mb-6 font-bebas-neue text-[3.15rem] text-light-100">
          Borrowed books
        </h2>
        {userBorrows.length > 0 ? (
          <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2">
            {userBorrows.map((b) => {
              const {
                borrowRecordId,
                borrowDate,
                dueDate,
                returnDate,
                status,
                ...book
              } = b as any;
              const receiptId = borrowRecordId ? borrowRecordId.substring(0, 8).toUpperCase() : null;
              return (
                <div key={borrowRecordId} className="relative">
                  <BookCard
                    {...(book as Book)}
                    isLoanedBook
                    borrowMeta={{ borrowDate, dueDate, returnDate, status }}
                  />
                  {receiptId && status === "BORROWED" && (
                    <DownloadReceiptButton receiptId={receiptId} />
                  )}
                </div>
              );
            })}
          </ul>
        ) : (
          <div className="flex h-64 items-center justify-center rounded-xl bg-dark-300 text-center md:w-[110%] md:-mr-6">
            <p className="max-w-lg text-lg text-light-200">
              You haven’t borrowed any books yet. Explore the library and borrow your first book to see it here.
            </p>
          </div>
        )}
      </section>
    </div>
  );
};
export default Page;
