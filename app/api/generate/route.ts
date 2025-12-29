import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, product, targetAudience, keyBenefits, tone, additionalInfo } = body

    // Build the prompt based on the copy type
    const prompts: Record<string, string> = {
      'website-headline': `Create a compelling website headline for ${product}. Target audience: ${targetAudience}. Tone: ${tone}. Key benefits: ${keyBenefits}. ${additionalInfo ? `Additional context: ${additionalInfo}` : ''}\n\nProvide 3 headline options with brief explanations.`,
      'product-description': `Write a professional product description for ${product}. Target audience: ${targetAudience}. Tone: ${tone}. Key benefits: ${keyBenefits}. ${additionalInfo ? `Additional context: ${additionalInfo}` : ''}\n\nInclude features, benefits, and a call to action.`,
      'email-campaign': `Create an email campaign copy for ${product}. Target audience: ${targetAudience}. Tone: ${tone}. Key benefits: ${keyBenefits}. ${additionalInfo ? `Additional context: ${additionalInfo}` : ''}\n\nInclude subject line, opening, body, and call to action.`,
      'social-media-post': `Write a social media post for ${product}. Target audience: ${targetAudience}. Tone: ${tone}. Key benefits: ${keyBenefits}. ${additionalInfo ? `Additional context: ${additionalInfo}` : ''}\n\nProvide 3 versions optimized for different platforms.`,
      'ad-copy': `Create ad copy for ${product}. Target audience: ${targetAudience}. Tone: ${tone}. Key benefits: ${keyBenefits}. ${additionalInfo ? `Additional context: ${additionalInfo}` : ''}\n\nInclude headline, body text, and call to action. Keep it concise and impactful.`,
      'blog-intro': `Write an engaging blog introduction about ${product}. Target audience: ${targetAudience}. Tone: ${tone}. Key benefits: ${keyBenefits}. ${additionalInfo ? `Additional context: ${additionalInfo}` : ''}\n\nHook the reader and establish the value proposition.`,
      'sales-letter': `Create a sales letter for ${product}. Target audience: ${targetAudience}. Tone: ${tone}. Key benefits: ${keyBenefits}. ${additionalInfo ? `Additional context: ${additionalInfo}` : ''}\n\nUse proven copywriting frameworks like AIDA or PAS.`,
      'tagline': `Create memorable taglines/slogans for ${product}. Target audience: ${targetAudience}. Tone: ${tone}. Key benefits: ${keyBenefits}. ${additionalInfo ? `Additional context: ${additionalInfo}` : ''}\n\nProvide 5 options that are catchy, memorable, and on-brand.`
    }

    const prompt = prompts[type] || prompts['website-headline']

    // Generate copy using Claude API via Anthropic
    const copy = await generateCopy(prompt)

    return NextResponse.json({ copy })
  } catch (error) {
    console.error('Error generating copy:', error)
    return NextResponse.json(
      { error: 'Failed to generate copy' },
      { status: 500 }
    )
  }
}

async function generateCopy(prompt: string): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY

  if (!apiKey) {
    // Fallback to mock generation if no API key
    return generateMockCopy(prompt)
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      })
    })

    if (!response.ok) {
      throw new Error('API request failed')
    }

    const data = await response.json()
    return data.content[0].text
  } catch (error) {
    console.error('Error calling Claude API:', error)
    return generateMockCopy(prompt)
  }
}

function generateMockCopy(prompt: string): string {
  // Extract key information from prompt
  const productMatch = prompt.match(/for ([^.]+)\./)
  const product = productMatch ? productMatch[1] : 'your product'

  if (prompt.includes('headline')) {
    return `**Option 1:** Transform Your Business with ${product}
Emphasizes transformation and directly addresses the target audience's desire for improvement.

**Option 2:** ${product} - Where Innovation Meets Simplicity
Balances two key values: cutting-edge solutions and ease of use.

**Option 3:** Unlock Your Full Potential with ${product}
Creates aspiration and positions the product as an enabler of success.`
  }

  if (prompt.includes('product description')) {
    return `Introducing ${product} - the professional solution designed to revolutionize the way you work.

Built specifically for discerning professionals who demand excellence, ${product} combines powerful features with intuitive design. Our platform streamlines your workflow, saves valuable time, and delivers results that exceed expectations.

**Key Features:**
• Advanced automation capabilities
• Seamless integration with existing tools
• Enterprise-grade security
• 24/7 customer support

**Why Choose ${product}?**
Join thousands of satisfied customers who have already transformed their business operations. With ${product}, you're not just buying a product - you're investing in your success.

Ready to get started? Try ${product} free for 14 days, no credit card required.`
  }

  if (prompt.includes('email')) {
    return `**Subject Line:** Discover how ${product} can transform your workflow

Hi there,

Are you tired of juggling multiple tools and wasting time on repetitive tasks?

${product} was created specifically to solve these challenges. Our platform brings everything you need into one powerful, easy-to-use solution.

Here's what you'll get:
✓ Streamlined workflows that save hours every week
✓ Powerful automation that works in the background
✓ Intuitive interface that requires no training
✓ Results you can measure from day one

Over 10,000 professionals have already made the switch. Here's what they're saying:

"${product} has completely transformed how we work. We're more efficient and our team is happier." - Sarah M., Operations Director

**Special Offer:** Start your free 14-day trial today and see the difference for yourself.

[Get Started Now]

Best regards,
The ${product} Team`
  }

  if (prompt.includes('social media')) {
    return `**LinkedIn Version:**
Tired of inefficient workflows? ${product} streamlines your operations and saves you hours every week. Join 10,000+ professionals who've already made the switch. Try free for 14 days → [link]

**Twitter Version:**
Say goodbye to workflow chaos! 🚀 ${product} brings everything you need into one powerful platform. Start your free trial today → [link] #productivity #automation

**Instagram Version:**
✨ Work smarter, not harder ✨

${product} helps professionals like you:
⚡ Save time on repetitive tasks
📊 Get better results
🎯 Stay focused on what matters

Link in bio to start your free trial!`
  }

  if (prompt.includes('ad copy')) {
    return `**Headline:** Transform Your Workflow in 14 Days

**Body:**
${product} is the all-in-one solution that helps professionals work smarter, not harder. Automate repetitive tasks, streamline operations, and achieve better results - all from one intuitive platform.

Trusted by 10,000+ professionals worldwide.

**Call to Action:**
Start Your Free Trial Today - No Credit Card Required`
  }

  if (prompt.includes('blog intro')) {
    return `In today's fast-paced business environment, efficiency isn't just a luxury - it's a necessity. Yet, countless professionals find themselves drowning in repetitive tasks, juggling multiple tools, and struggling to maintain productivity.

What if there was a better way?

Enter ${product}, a revolutionary solution that's transforming how professionals approach their daily work. But before we dive into the specifics, let's talk about why traditional approaches to workflow management are falling short and what makes a truly effective solution.

In this comprehensive guide, we'll explore how ${product} is helping thousands of professionals reclaim their time, streamline their operations, and achieve results they never thought possible. Whether you're a solo entrepreneur or part of a large organization, the insights shared here will change the way you think about productivity.

Let's get started.`
  }

  if (prompt.includes('sales letter')) {
    return `Dear Professional,

**PROBLEM:** You're working harder than ever, but feeling like you're falling behind.

Every day brings another pile of repetitive tasks. Another hour lost switching between tools. Another missed opportunity because you couldn't move fast enough.

Sound familiar?

**AGITATION:** You've tried other solutions. Downloaded the apps, watched the tutorials, promised yourself things would change. But nothing really solved the underlying problem. You're still overwhelmed, still stressed, still looking for a way out.

**SOLUTION:** That's why we created ${product}.

${product} isn't just another productivity tool - it's a complete transformation of how you work. We've taken everything you need and combined it into one powerful, intuitive platform that actually delivers on its promises.

**Here's what makes ${product} different:**

✓ It works WITH your existing workflow, not against it
✓ Setup takes minutes, not days
✓ Results are visible from day one
✓ No technical expertise required

**The Results Speak for Themselves:**

Our customers report an average of 10 hours saved per week. That's an entire workday back in your pocket. Time you can spend on what really matters - growing your business, serving your customers, or simply enjoying life outside of work.

**Risk-Free Guarantee:**

Try ${product} free for 14 days. If you don't see immediate improvements in your workflow, simply cancel - no questions asked.

**Your Next Step:**

The choice is yours. You can continue struggling with the status quo, or you can take action today and join the thousands of professionals who've already transformed their work with ${product}.

[Start Your Free Trial Now]

To your success,
The ${product} Team

P.S. Remember, you have nothing to lose with our 14-day free trial. But every day you wait is another day of lost productivity. Take action now.`
  }

  if (prompt.includes('tagline')) {
    return `**Option 1:** ${product} - Work Smarter, Achieve More
Simple, aspirational, and focused on results.

**Option 2:** Where Productivity Meets Simplicity
Emphasizes the dual benefits of power and ease of use.

**Option 3:** ${product} - Your Success, Simplified
Personal and benefit-focused, positioning the product as an enabler.

**Option 4:** Transform Work, Transform Results
Action-oriented and emphasizes tangible outcomes.

**Option 5:** ${product} - The Smarter Way to Work
Positions the product as an intelligent, modern solution.`
  }

  return `${product} represents the future of professional excellence. Our innovative solution combines cutting-edge technology with user-friendly design to deliver exceptional results.

With ${product}, you'll experience unprecedented efficiency, seamless workflow integration, and measurable improvements in productivity. Join thousands of satisfied customers who have already discovered the difference.

Ready to transform your work? Get started with ${product} today.`
}
