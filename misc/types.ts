export type LeafPayload = {
   index?: number;
   hash?: string;
   proof?: string[];
   version: number;
   epoch_id: number;
   event_id: string;
   user_pubkey: string;

   amount_user: number;
   referrer_pubkey: string;
   amount_ref: number;
   amount_vip: number;
   expire_at_unix: number;
   partner_id: number;

   tracking_tag: string;
};
