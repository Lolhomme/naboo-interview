import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SignUpInput } from 'src/auth/types';
import { User } from './user.schema';
import * as bcrypt from 'bcrypt';
import { Activity } from '../activity/activity.schema';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Activity.name) private activityModel: Model<Activity>,
  ) {}

  async getByEmail(email: string): Promise<User> {
    const user = await this.userModel.findOne({ email: email }).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email: email }).exec();
  }

  async getById(id: string): Promise<User> {
    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async createUser(
    data: SignUpInput & {
      role?: User['role'];
    },
  ): Promise<User> {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    const user = new this.userModel({ ...data, password: hashedPassword });
    return user.save();
  }

  async updateToken(id: string, token: string): Promise<User> {
    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    user.token = token;
    return user.save();
  }

  async countDocuments(): Promise<number> {
    return this.userModel.countDocuments().exec();
  }

  async setDebugMode({
    userId,
    enabled,
  }: {
    userId: string;
    enabled: boolean;
  }): Promise<User> {
    const user = await this.userModel.findByIdAndUpdate(
      userId,
      {
        debugModeEnabled: enabled,
      },
      { new: true },
    );
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async addFavoriteActivity(userId: string, activityId: string): Promise<User> {
    const exists = await this.activityModel.exists({ _id: activityId });
    if (!exists) throw new NotFoundException('Activity not found');

    // Ensure activityId is a Types.ObjectId
    const activityObjectId =
      typeof activityId === 'string'
        ? new this.activityModel.base.Types.ObjectId(activityId)
        : activityId;

    const user = await this.userModel
      .findByIdAndUpdate(
        userId,
        { $addToSet: { favoriteActivityIds: activityObjectId } },
        { new: true },
      )
      .exec();
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async removeFavoriteActivity(
    userId: string,
    activityId: string,
  ): Promise<User> {
    // Ensure activityId is a Types.ObjectId
    const activityObjectId =
      typeof activityId === 'string'
        ? new this.activityModel.base.Types.ObjectId(activityId)
        : activityId;

    const user = await this.userModel
      .findByIdAndUpdate(
        userId,
        { $pull: { favoriteActivityIds: activityObjectId } },
        { new: true },
      )
      .exec();
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async getFavoriteActivities(userId: string): Promise<Activity[]> {
    const user = await this.userModel
      .findById(userId)
      .select('favoriteActivityIds')
      .exec();
    if (!user) throw new NotFoundException('User not found');
    const ids = user.favoriteActivityIds ?? [];
    if (!ids.length) return [];
    const activities = await this.activityModel
      .find({ _id: { $in: ids } })
      .exec();

    return activities;
  }
}
