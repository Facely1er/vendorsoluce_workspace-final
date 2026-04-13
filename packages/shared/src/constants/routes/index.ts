import routes from '../../../routes.json';

export const MR = routes.marketing as Record<string, string>;
export const WR = routes.workspace as Record<string, string>;
export const AR = routes.auth as Record<string, string>;
export const PR = routes.portal as Record<string, string>;

export { isWorkspaceAppPath } from './workspaceChrome';

export default routes;
