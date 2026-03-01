import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: { createdAt: true, updatedAt: false } })
export class FollowRef extends Document {
    @Prop({ required: true })
    follower_id!: string;

    @Prop({ required: true })
    follower_email!: string;

    @Prop({ required: true })
    follower_name!: string;

    @Prop({ required: true })
    followed_id!: string;
}

export const FollowRefSchema = SchemaFactory.createForClass(FollowRef);

// Índice compuesto para búsqueda rápida y unicidad
FollowRefSchema.index({ follower_id: 1, followed_id: 1 }, { unique: true });

// Índice para búsqueda por artista seguido (Fase 3)
FollowRefSchema.index({ followed_id: 1 });
