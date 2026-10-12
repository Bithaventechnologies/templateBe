import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const templates = [
  {
    slug: "business",
    name: "Business",
    description: "Formal and clean",
    icon: "💼",
    category: "business",
    fields: ["btn"],
    defaults: {
      subject: "Following up on our conversation",
      headline: "Following up",
      message:
        "Thank you for taking the time to speak with us. I wanted to follow up and share the next steps we discussed.\n\nPlease let me know a time that suits you for a short call this week.",
    },
  },
  {
    slug: "welcome",
    name: "Welcome",
    description: "Greet new people",
    icon: "👋",
    category: "welcome",
    fields: ["btn"],
    defaults: {
      subject: "Welcome aboard!",
      headline: "Welcome, we're glad you're here",
      message:
        "Your account is ready and everything is set up for you.\n\nIf you need a hand getting started, just reply to this email and we'll help.",
      btnText: "Get started",
    },
  },
  {
    slug: "congrats",
    name: "Congratulations",
    description: "Celebrate a win",
    icon: "🎉",
    category: "congratulations",
    fields: [],
    defaults: {
      subject: "Congratulations!",
      headline: "Congratulations!",
      message:
        "We heard your great news and wanted to celebrate with you. Your hard work and dedication have truly paid off.\n\nWishing you continued success ahead.",
    },
  },
  {
    slug: "promo",
    name: "Promotional",
    description: "Offers and discounts",
    icon: "🏷️",
    category: "promotional",
    fields: ["code", "btn"],
    defaults: {
      subject: "A special offer just for you",
      headline: "20% off, this week only",
      message:
        "As one of our valued customers, you get early access to our biggest sale of the season.\n\nUse the code below at checkout before the offer ends.",
      btnText: "Shop the sale",
      code: "SAVE20",
    },
  },
  {
    slug: "announce",
    name: "Announcement",
    description: "News and updates",
    icon: "📣",
    category: "announcement",
    fields: ["detail", "btn"],
    defaults: {
      subject: "An important update from us",
      headline: "We have news to share",
      message:
        "We're excited to announce a change that will make things better for you.\n\nHere is what's new and what it means for you. Reach out any time if you have questions.",
      btnText: "Read more",
      detail: "Effective: 1 November",
    },
  },
  {
    slug: "thanks",
    name: "Thank you",
    description: "Show appreciation",
    icon: "💛",
    category: "thank-you",
    fields: [],
    defaults: {
      subject: "Thank you",
      headline: "Thank you so much",
      message:
        "We truly appreciate your support. Customers like you are the reason we do what we do.\n\nIt was a pleasure working with you, and we hope to see you again soon.",
    },
  },
];

async function main() {
  for (const t of templates) {
    await prisma.template.upsert({
      where: { slug: t.slug },
      update: {},
      create: t,
    });
  }
  await prisma.settings.upsert({ where: { id: 1 }, update: {}, create: { id: 1 } });
  console.log(`Seeded ${templates.length} templates.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
