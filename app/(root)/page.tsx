import BookList from "@/components/BookList";
import BookOverview from "@/components/BookOverview";
import { auth } from "@/auth";
import dummyBooks from "../../dummybooks.json";

const Home = async () => {
  const session = await auth();

  // Render from dummybooks.json (first as featured, rest as list)
  const latestBooks = dummyBooks as unknown as Book[];

  return (
    <>
      {latestBooks.length > 0 && (
        <BookOverview {...latestBooks[0]} userId={session?.user?.id as string} />
      )}

      <BookList
        title="Latest Books"
        books={latestBooks.slice(1)}
        containerClassName="mt-28"
      />
    </>
  );
};

export default Home;
