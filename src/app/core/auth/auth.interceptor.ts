import { HttpInterceptorFn } from '@angular/common/http';

const API_BASE = 'http://192.168.9.33:8085/api';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('auth_token');
  const isApiRequest = req.url.startsWith(API_BASE);

  if (!token || !isApiRequest) {
    return next(req);
  }

  const authReq = req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`,
    },
  });

  return next(authReq);
};
