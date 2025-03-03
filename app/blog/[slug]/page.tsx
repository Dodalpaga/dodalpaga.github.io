import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import NavBar from '@/components/navbar';
import Footer from '@/components/footer';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug'; // Import rehype-slug
import rehypeFormat from 'rehype-format'; // Optional for formatting
import rehypeRaw from 'rehype-raw'; // Import rehype-raw
import rehypeHighlight from 'rehype-highlight';
import './blog.css';
import './markdown.css';
import 'highlight.js/styles/github.css'; // Example theme
import { Metadata } from 'next';

const PostPage = async ({ params }: { params: { slug: string } }) => {
  const { slug } = params;
  const filePath = path.join(process.cwd(), 'content/blog', `${slug}.md`);
  const fileContents = fs.readFileSync(filePath, 'utf8');
  const { data, content } = matter(fileContents);

  if (!fs.existsSync(filePath)) {
    return <h1>Post not found</h1>; // Replace with a 404 component as needed
  }

  return (
    <main className="flex min-h-screen flex-col justify-between">
      <div
        className="flex flex-col items-center justify-between p-4"
        style={{ height: '84px' }}
      >
        <NavBar />
      </div>
      <div className="flex flex-col p-4">
        <div className="blog-header">
          <h1>{data.title}</h1>
          <p>{data.description}</p>
        </div>
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeSlug, rehypeRaw, rehypeFormat, rehypeHighlight]}
          className="markdown"
        >
          {content}
        </ReactMarkdown>
      </div>
      <Footer brandName="Dorian Voydie" />
    </main>
  );
};

// Define metadata dynamically based on the markdown file
export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const { slug } = params;
  const filePath = path.join(process.cwd(), 'content/blog', `${slug}.md`);
  const fileContents = fs.readFileSync(filePath, 'utf8');
  const { data } = matter(fileContents);

  return {
    title: data.title, // Use the title from the markdown file
    description: data.description, // Use the description from the markdown file
  };
}

export function generateStaticParams() {
  const postsDirectory = path.join(process.cwd(), 'content/blog');
  const filenames = fs.readdirSync(postsDirectory);

  return filenames.map((filename) => ({
    slug: filename.replace('.md', ''),
  }));
}

export default PostPage;
