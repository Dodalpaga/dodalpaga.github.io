import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import NavBar from '../../components/navbar';
import Footer from '../../components/footer';
import Content from './content';

export default async function BlogPage() {
  const postsDirectory = path.join(process.cwd(), 'content/blog');
  const filenames = fs.readdirSync(postsDirectory);

  // Filter for only .md files
  const mdFilenames = filenames.filter((filename) => filename.endsWith('.md'));

  const blogPosts = mdFilenames.map((filename) => {
    const filePath = path.join(postsDirectory, filename);
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const { data } = matter(fileContents);

    return {
      title: data.title,
      description: data.description,
      slug: filename.replace('.md', ''),
      image: data.image || '/default-image.png',
      date: data.date,
    };
  });

  return (
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
      <div className="flex flex-col items-center justify-start p-4 flex-grow">
        <Content blogPosts={blogPosts} />
      </div>
      <Footer brandName="Dorian Voydie" />
    </main>
  );
}
