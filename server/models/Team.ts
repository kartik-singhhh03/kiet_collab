import mongoose, { Document, Schema } from 'mongoose';

export interface ITeam extends Document {
  team_name:               string;
  hackathon_name:          string;
  created_by:              mongoose.Types.ObjectId;
  members:                 mongoose.Types.ObjectId[];
  required_skills:         string[];
  required_female_members: number;
  max_team_size:           number;
  createdAt:               Date;
}

const TeamSchema = new Schema<ITeam>(
  {
    team_name: {
      type:      String,
      required:  [true, 'team_name is required'],
      trim:      true,
      minlength: [3,  'Team name must be at least 3 characters'],
      maxlength: [50, 'Team name cannot exceed 50 characters'],
    },
    hackathon_name: {
      type:     String,
      required: [true, 'hackathon_name is required'],
      trim:     true,
    },
    created_by: {
      type:     Schema.Types.ObjectId,
      ref:      'User',
      required: true,
    },
    members: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    required_skills: {
      type:    [String],
      default: [],
    },
    required_female_members: {
      type:    Number,
      default: 0,
      min:     [0, 'required_female_members cannot be negative'],
    },
    max_team_size: {
      type:     Number,
      required: [true, 'max_team_size is required'],
      min:      [2,  'Team size must be at least 2'],
      max:      [10, 'Team size cannot exceed 10'],
    },
  },
  { timestamps: true }
);

// Prevent duplicate team name within the same hackathon
TeamSchema.index({ team_name: 1, hackathon_name: 1 }, { unique: true });

export default mongoose.model<ITeam>('Team', TeamSchema);
