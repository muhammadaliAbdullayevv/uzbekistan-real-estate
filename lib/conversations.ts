import { randomUUID } from "node:crypto";

import { prisma } from "@/lib/db";

export type ConversationSummary = {
  id: string;
  listingId: string;
  listingTitle: string;
  listingImage: string | null;
  buyerId: string;
  ownerId: string;
  otherUserId: string;
  otherName: string | null;
  otherAvatarUrl: string | null;
  lastMessageBody: string | null;
  lastMessageAt: Date | null;
  lastMessageSenderId: string | null;
  unreadCount: number;
  updatedAt: Date;
};

export type ChatMessage = {
  id: string;
  conversationId: string;
  senderId: string;
  body: string;
  createdAt: Date;
  readAt: Date | null;
};

type ConversationParticipants = {
  id: string;
  listingId: string;
  buyerId: string;
  ownerId: string;
} | null;

/**
 * A conversation is scoped to one (listing, buyer, owner) triple, so a buyer
 * re-opening "Message owner" on the same listing always lands back in the
 * same thread instead of spawning duplicates.
 */
export async function getOrCreateConversation(input: {
  listingId: string;
  buyerId: string;
  ownerId: string;
}) {
  const existing = await prisma.$queryRaw<{ id: string }[]>`
    SELECT "id" FROM "Conversation"
    WHERE "listingId" = ${input.listingId} AND "buyerId" = ${input.buyerId} AND "ownerId" = ${input.ownerId}
    LIMIT 1
  `;

  if (existing[0]) {
    return existing[0].id;
  }

  const id = randomUUID();
  const now = new Date();

  await prisma.$executeRaw`
    INSERT INTO "Conversation" ("id", "listingId", "buyerId", "ownerId", "createdAt", "updatedAt")
    VALUES (${id}, ${input.listingId}, ${input.buyerId}, ${input.ownerId}, ${now}, ${now})
    ON CONFLICT ("listingId", "buyerId", "ownerId") DO NOTHING
  `;

  const row = await prisma.$queryRaw<{ id: string }[]>`
    SELECT "id" FROM "Conversation"
    WHERE "listingId" = ${input.listingId} AND "buyerId" = ${input.buyerId} AND "ownerId" = ${input.ownerId}
    LIMIT 1
  `;

  return row[0]?.id ?? id;
}

export type ConversationDetail = {
  id: string;
  listingId: string;
  listingTitle: string;
  buyerId: string;
  ownerId: string;
  otherUserId: string;
  otherName: string | null;
  otherAvatarUrl: string | null;
};

export async function getConversationDetailForUser(conversationId: string, userId: string) {
  const rows = await prisma.$queryRaw<ConversationDetail[]>`
    SELECT
      c."id" AS "id",
      c."listingId" AS "listingId",
      l."title" AS "listingTitle",
      c."buyerId" AS "buyerId",
      c."ownerId" AS "ownerId",
      CASE WHEN c."buyerId" = ${userId} THEN c."ownerId" ELSE c."buyerId" END AS "otherUserId",
      CASE WHEN c."buyerId" = ${userId} THEN ownerUser."name" ELSE buyerUser."name" END AS "otherName",
      CASE WHEN c."buyerId" = ${userId} THEN ownerUser."avatarUrl" ELSE buyerUser."avatarUrl" END AS "otherAvatarUrl"
    FROM "Conversation" c
    JOIN "Listing" l ON l."id" = c."listingId"
    JOIN "User" buyerUser ON buyerUser."id" = c."buyerId"
    JOIN "User" ownerUser ON ownerUser."id" = c."ownerId"
    WHERE c."id" = ${conversationId} AND (c."buyerId" = ${userId} OR c."ownerId" = ${userId})
    LIMIT 1
  `;

  return rows[0] ?? null;
}

export async function getConversationForUser(conversationId: string, userId: string) {
  const rows = await prisma.$queryRaw<ConversationParticipants[]>`
    SELECT "id", "listingId", "buyerId", "ownerId"
    FROM "Conversation"
    WHERE "id" = ${conversationId} AND ("buyerId" = ${userId} OR "ownerId" = ${userId})
    LIMIT 1
  `;

  return rows[0] ?? null;
}

export async function listConversationsForUser(userId: string): Promise<ConversationSummary[]> {
  const rows = await prisma.$queryRaw<ConversationSummary[]>`
    SELECT
      c."id" AS "id",
      c."listingId" AS "listingId",
      l."title" AS "listingTitle",
      (
        SELECT li."url" FROM "ListingImage" li
        WHERE li."listingId" = l."id"
        ORDER BY li."id" ASC
        LIMIT 1
      ) AS "listingImage",
      c."buyerId" AS "buyerId",
      c."ownerId" AS "ownerId",
      CASE WHEN c."buyerId" = ${userId} THEN c."ownerId" ELSE c."buyerId" END AS "otherUserId",
      CASE WHEN c."buyerId" = ${userId} THEN ownerUser."name" ELSE buyerUser."name" END AS "otherName",
      CASE WHEN c."buyerId" = ${userId} THEN ownerUser."avatarUrl" ELSE buyerUser."avatarUrl" END AS "otherAvatarUrl",
      lastMsg."body" AS "lastMessageBody",
      lastMsg."createdAt" AS "lastMessageAt",
      lastMsg."senderId" AS "lastMessageSenderId",
      COALESCE(unread."count", 0)::int AS "unreadCount",
      c."updatedAt" AS "updatedAt"
    FROM "Conversation" c
    JOIN "Listing" l ON l."id" = c."listingId"
    JOIN "User" buyerUser ON buyerUser."id" = c."buyerId"
    JOIN "User" ownerUser ON ownerUser."id" = c."ownerId"
    LEFT JOIN LATERAL (
      SELECT "body", "createdAt", "senderId"
      FROM "Message" m
      WHERE m."conversationId" = c."id"
      ORDER BY m."createdAt" DESC
      LIMIT 1
    ) lastMsg ON true
    LEFT JOIN LATERAL (
      SELECT COUNT(*)::int AS "count"
      FROM "Message" m2
      WHERE m2."conversationId" = c."id" AND m2."senderId" != ${userId} AND m2."readAt" IS NULL
    ) unread ON true
    WHERE c."buyerId" = ${userId} OR c."ownerId" = ${userId}
    ORDER BY c."updatedAt" DESC
  `;

  return rows;
}

export async function hasUnreadMessages(userId: string) {
  const rows = await prisma.$queryRaw<{ exists: boolean }[]>`
    SELECT EXISTS (
      SELECT 1
      FROM "Message" m
      JOIN "Conversation" c ON c."id" = m."conversationId"
      WHERE m."senderId" != ${userId}
        AND m."readAt" IS NULL
        AND (c."buyerId" = ${userId} OR c."ownerId" = ${userId})
    ) AS "exists"
  `;

  return rows[0]?.exists ?? false;
}

export async function getMessages(conversationId: string, limit = 300): Promise<ChatMessage[]> {
  const rows = await prisma.$queryRaw<ChatMessage[]>`
    SELECT "id", "conversationId", "senderId", "body", "createdAt", "readAt"
    FROM "Message"
    WHERE "conversationId" = ${conversationId}
    ORDER BY "createdAt" ASC
    LIMIT ${limit}
  `;

  return rows;
}

export async function markMessagesRead(conversationId: string, readerId: string) {
  await prisma.$executeRaw`
    UPDATE "Message"
    SET "readAt" = NOW()
    WHERE "conversationId" = ${conversationId} AND "senderId" != ${readerId} AND "readAt" IS NULL
  `;
}

export async function sendMessage(input: {
  conversationId: string;
  senderId: string;
  body: string;
}) {
  const id = randomUUID();
  const now = new Date();

  await prisma.$executeRaw`
    INSERT INTO "Message" ("id", "conversationId", "senderId", "body", "createdAt")
    VALUES (${id}, ${input.conversationId}, ${input.senderId}, ${input.body}, ${now})
  `;

  await prisma.$executeRaw`
    UPDATE "Conversation" SET "updatedAt" = ${now} WHERE "id" = ${input.conversationId}
  `;

  return { id, conversationId: input.conversationId, senderId: input.senderId, body: input.body, createdAt: now, readAt: null as Date | null };
}
