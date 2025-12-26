import { motion } from "framer-motion";
import { Calendar, User, ArrowRight, Clock } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const blogPosts = [
  {
    id: 1,
    title: "How to Land Your Dream Internship in 2024",
    excerpt: "Discover the strategies and tips that will help you stand out from the crowd and secure your ideal internship position.",
    author: "Sarah Johnson",
    date: "Dec 20, 2024",
    readTime: "5 min read",
    category: "Career Tips",
  },
  {
    id: 2,
    title: "The Importance of Networking for Students",
    excerpt: "Learn why building professional connections early in your career can open doors you never knew existed.",
    author: "Michael Chen",
    date: "Dec 18, 2024",
    readTime: "4 min read",
    category: "Networking",
  },
  {
    id: 3,
    title: "Top Skills Employers Look for in 2024",
    excerpt: "Stay ahead of the curve by developing these essential skills that employers are actively seeking.",
    author: "Emily Rodriguez",
    date: "Dec 15, 2024",
    readTime: "6 min read",
    category: "Skills",
  },
  {
    id: 4,
    title: "Remote Internships: A Complete Guide",
    excerpt: "Everything you need to know about finding and succeeding in remote internship opportunities.",
    author: "David Park",
    date: "Dec 12, 2024",
    readTime: "7 min read",
    category: "Remote Work",
  },
  {
    id: 5,
    title: "Building a Professional LinkedIn Profile",
    excerpt: "Step-by-step guide to creating a LinkedIn profile that attracts recruiters and opens opportunities.",
    author: "Jessica Williams",
    date: "Dec 10, 2024",
    readTime: "5 min read",
    category: "Personal Branding",
  },
  {
    id: 6,
    title: "From Intern to Full-Time: Success Stories",
    excerpt: "Inspiring stories of students who turned their internships into full-time career opportunities.",
    author: "Alex Thompson",
    date: "Dec 8, 2024",
    readTime: "8 min read",
    category: "Success Stories",
  },
];

const Blog = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-24 pb-16 lg:pt-32 lg:pb-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/90 to-primary/80" />
        <div className="absolute inset-0 bg-[url('/placeholder.svg')] opacity-5" />
        
        <div className="container mx-auto px-4 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <motion.span
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="inline-block px-4 py-2 rounded-full bg-accent/20 text-accent font-medium text-sm mb-6"
            >
              Our Blog
            </motion.span>
            
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary-foreground mb-4"
            >
              Insights &{" "}
              <span className="relative inline-block">
                <span className="text-accent">Resources</span>
                <motion.span
                  className="absolute -bottom-1 left-0 w-full h-1 bg-accent rounded-full"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.8, delay: 0.8 }}
                />
              </span>
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-lg text-primary-foreground/80"
            >
              Expert advice, industry insights, and career guidance to help you succeed.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts.map((post, index) => (
              <motion.article
                key={post.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="bg-card rounded-2xl border border-border overflow-hidden hover:shadow-lg transition-shadow group"
              >
                <div className="aspect-video bg-gradient-to-br from-primary/20 to-accent/20" />
                <div className="p-6">
                  <span className="inline-block px-3 py-1 rounded-full bg-accent/10 text-accent text-sm font-medium mb-4">
                    {post.category}
                  </span>
                  <h2 className="text-xl font-bold text-foreground mb-3 group-hover:text-accent transition-colors">
                    {post.title}
                  </h2>
                  <p className="text-muted-foreground mb-4 line-clamp-2">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      <span>{post.author}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{post.date}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{post.readTime}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <Button variant="outline" size="lg">
              Load More Articles
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Blog;
