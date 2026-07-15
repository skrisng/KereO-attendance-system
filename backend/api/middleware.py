import time
import logging
from django.utils.deprecation import MiddlewareMixin

logger = logging.getLogger(__name__)


class RequestLoggingMiddleware(MiddlewareMixin):
    """
    Middleware to log all API requests and responses
    """
    
    def process_request(self, request):
        """Log request details"""
        request.start_time = time.time()
        
        logger.info(f"Request: {request.method} {request.path}")
        
        if request.body:
            try:
                # Don't log large base64 images
                if 'base64' not in request.path:
                    logger.debug(f"Body: {request.body[:200]}")
            except:
                pass
    
    def process_response(self, request, response):
        """Log response details"""
        if hasattr(request, 'start_time'):
            duration = time.time() - request.start_time
            logger.info(
                f"Response: {request.method} {request.path} "
                f"Status: {response.status_code} "
                f"Duration: {duration:.2f}s"
            )
        
        return response


class PerformanceMonitoringMiddleware(MiddlewareMixin):
    """
    Middleware to monitor API performance
    """
    
    def process_request(self, request):
        request.start_time = time.time()
    
    def process_response(self, request, response):
        if hasattr(request, 'start_time'):
            duration = time.time() - request.start_time
            
            # Add performance header
            response['X-Response-Time'] = f"{duration:.3f}s"
            
            # Warn on slow requests
            if duration > 2.0:
                logger.warning(
                    f"Slow request: {request.method} {request.path} "
                    f"took {duration:.2f}s"
                )
        
        return response
