import { Op } from 'sequelize';
import {
  startOfDay,
  endOfDay,
  format,
  setHours,
  setMinutes,
  setSeconds,
  isAfter,
} from 'date-fns';

// Models
import User from '../models/User';
import Appointment from '../models/Appointment';

class AvaiableController {
  async index(req, res) {
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ error: 'Date is required.' });
    }

    const provider = await User.findOne({
      where: { id: req.params.provider_id, provider: true },
    });

    if (!provider) {
      return res.status(400).json({ error: 'Only providers has a schedule.' });
    }
    const searchDate = Number(date);

    const appointments = await Appointment.findAll({
      where: {
        provider_id: provider.id,
        canceled_at: null,
        date: {
          [Op.between]: [startOfDay(searchDate), endOfDay(searchDate)],
        },
      },
    });

    const schedule = [
      '07:00',
      '08:00',
      '09:00',
      '10:00',
      '11:00',
      '12:00',
      '13:00',
      '14:00',
      '15:00',
      '16:00',
      '17:00',
      '18:00',
      '19:00',
    ];

    const avaiable = schedule.map(time => {
      const [hour, minute] = time.split(':');
      const value = setSeconds(
        setMinutes(setHours(searchDate, hour), minute),
        0
      );

      return {
        time,
        value: format(value, "yyyy-MM-dd'T'HH:mm:ssxxx"),
        avaiable:
          isAfter(value, new Date()) &&
          !appointments.find(a => format(a.date, 'HH:mm') === time),
      };
    });

    return res.json(avaiable);
  }
}

export default new AvaiableController();
