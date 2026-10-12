import { z } from 'zod';

export const MonthSchema = z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/);
export const ChannelSchema = z.enum(['ShoppingNT', 'KT', 'CJ']);
export const VatSchema = z.enum(['included', 'excluded', 'unspecified']);
export const PriceBasisSchema = z.enum(['time_slot_fee', 'live_airing_fee', 'set_fee']);
export const ReviewStateSchema = z.enum(['unresolved', 'approved', 'rejected']);

export const EvidenceSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  sha256: z.string().regex(/^[a-f0-9]{64}$/),
  page: z.number().int().positive(),
  locator: z.string().min(1),
  synthetic: z.boolean()
}).strict();

export const DraftOfferSchema = z.object({
  id: z.string().min(1),
  month: MonthSchema.nullable(),
  channel: ChannelSchema.nullable(),
  segment: z.enum(['DEFAULT', 'TV_LIVE', 'T_COMMERCE']).optional(),
  label: z.string().optional(),
  priceManwon: z.number().int().nullable(),
  vat: VatSchema.nullable().optional(),
  priceBasis: PriceBasisSchema.optional(),
  reviewState: ReviewStateSchema,
  monthConfirmed: z.boolean(),
  evidenceId: z.string().optional()
}).passthrough();

export const PublishedOfferSchema = DraftOfferSchema.extend({
  month: MonthSchema,
  channel: ChannelSchema,
  segment: z.enum(['DEFAULT', 'TV_LIVE', 'T_COMMERCE']),
  label: z.string().min(1),
  priceManwon: z.number().int().positive(),
  vat: VatSchema,
  priceBasis: PriceBasisSchema,
  reviewState: z.literal('approved'),
  monthConfirmed: z.literal(true),
  evidenceId: z.string().min(1)
}).strict();

export const AiringSchema = z.object({
  id: z.string().min(1),
  offerId: z.string().min(1),
  channel: ChannelSchema,
  day: z.enum(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']),
  start: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
  end: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
  endDayOffset: z.union([z.literal(0), z.literal(1)]),
  kind: z.enum(['slot', 'live', 'set-component']),
  timeKind: z.enum(['explicit', 'derived_example', 'unconfirmed']),
  evidenceId: z.string().min(1)
}).strict();

export const RuleSchema = z.object({
  id: z.string().min(1),
  channel: ChannelSchema,
  kind: z.enum(['disclaimer', 'vat', 'condition']),
  label: z.string().min(1),
  priceManwon: z.null(),
  evidenceId: z.string().min(1)
}).strict();

export const VideoSchema = z.object({
  id: z.string().regex(/^[\w-]{11}$/),
  month: MonthSchema,
  sourceChannel: z.string().min(1),
  title: z.string().min(1),
  country: z.string().min(1),
  region: z.string().min(1),
  contentType: z.enum(['여행지', '호텔·리조트', '투어·액티비티']),
  durationSeconds: z.number().int().positive(),
  url: z.string().url(),
  approved: z.boolean()
}).strict();

export const PublishedReleaseSchema = z.object({
  id: z.string().min(1), month: MonthSchema, version: z.string().min(1), publishedAt: z.string().datetime(), unit: z.literal('만원'), synthetic: z.boolean(),
  evidence: z.array(EvidenceSchema), offers: z.array(PublishedOfferSchema), airings: z.array(AiringSchema), rules: z.array(RuleSchema), videos: z.array(VideoSchema),
  counts: z.object({ offers: z.number().int().nonnegative(), airings: z.number().int().nonnegative(), rules: z.number().int().nonnegative(), videos: z.number().int().nonnegative() }).strict(),
  contentHash: z.string().regex(/^[a-f0-9]{64}$/)
}).strict();

export type Release = z.infer<typeof PublishedReleaseSchema>;
