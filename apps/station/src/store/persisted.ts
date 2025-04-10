import { storageService } from '../../../shared/index.js';

export const stationStorage = storageService.withInstanceID('station').initialize();
