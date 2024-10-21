// app/blog/[slug]/page.tsx
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import NavBar from '../../../components/navbar';
import Footer from '../../../components/footer';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug'; // Import rehype-slug
import rehypeFormat from 'rehype-format'; // Optional for formatting
import './markdown.css';
import './blog.css';
import Head from 'next/head';

const PostPage = async ({ params }: { params: { slug: string } }) => {
  const { slug } = params;
  const filePath = path.join(process.cwd(), 'content/blog', `${slug}.md`);
  const fileContents = fs.readFileSync(filePath, 'utf8');
  const { data, content } = matter(fileContents);

  if (!fs.existsSync(filePath)) {
    return <h1>Post not found</h1>; // Replace with a 404 component as needed
  }

  return (
    <>
      <Head>
        <title>{data.title}</title>
        <meta name="description" content={data.description} />
      </Head>
      <main className="flex min-h-screen flex-col justify-between">
        <div
          className="flex flex-col items-center justify-between p-4"
          style={{ height: '84px' }}
        >
          <NavBar
            brandName="Dorian Voydie"
            imageSrcPath={`/assets/mountain.png`}
          />
        </div>
        <div className="flex flex-col p-4">
          <div className="blog-header">
            <h1>{data.title}</h1>
            <p>{data.description}</p>
          </div>
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeSlug, rehypeFormat]}
            className="markdown"
          >
            {content}
          </ReactMarkdown>
        </div>
        <Footer brandName="Dorian Voydie" />
      </main>
    </>
  );
};

export function generateStaticParams() {
  const postsDirectory = path.join(process.cwd(), 'content/blog');
  const filenames = fs.readdirSync(postsDirectory);

  return filenames.map((filename) => ({
    slug: filename.replace('.md', ''),
  }));
}

export default PostPage;
