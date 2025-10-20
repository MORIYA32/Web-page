




const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    avatar: {
        type: String,
        default: "https://occ-0-8214-784.1.nflxso.net/dnm/api/v6/vN7bi_My87NPKvsBoib006Llxzg/AAAABdgqRu86LNrfFPuQ2Xhlz2NQehmsezXIx7HyVhyQXZ1wK8n97QjoJnDaiuKnWVnXclSIoqmrdlcXykFzFbnQP91p8rM-yxTFwQ.png?r=181"
    }
}, {
    timestamps: true
});

const MAX_PROFILES_PER_USER = Number(process.env.MAX_PROFILES_PER_USER || 5);

profileSchema.pre('save', async function (next) {
    try {
        if (!this.isNew) return next();

        const Model = this.constructor;
        const count = await Model.countDocuments({ userId: this.userId });
        if (count >= MAX_PROFILES_PER_USER) {
            const err = new Error(`Profile limit (${MAX_PROFILES_PER_USER}) reached for this user`);
            err.name = 'ProfileLimitError';
            err.status = 400;
            return next(err);
        }
        next();
    } catch (e) {
        next(e);
    }
});

const Profile = mongoose.model('Profile', profileSchema);

module.exports = Profile;

