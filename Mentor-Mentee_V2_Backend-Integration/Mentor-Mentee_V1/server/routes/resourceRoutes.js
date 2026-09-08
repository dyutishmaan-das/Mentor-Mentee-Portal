import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import * as controller from '../controllers/resourceController.js';
import { resourceRegistry } from '../config/resourceRegistry.js';

const router = Router();
router.use(authenticate);
for (const name of Object.keys(resourceRegistry)) {
  router.get(`/${name}`, controller.list(name));
  router.post(`/${name}`, controller.create(name));
  router.patch(`/${name}/:id`, controller.update(name));
}
export default router;
