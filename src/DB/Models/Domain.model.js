const { Schema, model, models } = require('mongoose');

const DomainSchema = new Schema(
    {
        domainName: {
            type: String,
            required: true
        },
        type: {
            type: String,
            required: true
        },
        value: {
            type: String,
            required: true
        },
        zone: {
            type: String,
            required: true
        }
    },
    {
        timestamps: true,
    }
);

const Domain = models.Domain || model('Domain', DomainSchema);

module.exports = Domain;
