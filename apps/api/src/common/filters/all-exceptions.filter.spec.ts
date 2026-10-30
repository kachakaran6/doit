import { ArgumentsHost, HttpStatus } from '@nestjs/common';
import { AllExceptionsFilter } from './all-exceptions.filter';
import { AppError } from '../errors/app.error';
import { ErrorCode } from '../errors/error-code.enum';

describe('AllExceptionsFilter', () => {
  let filter: AllExceptionsFilter;
  let mockResponse: {
    status: jest.Mock;
    json: jest.Mock;
    setHeader: jest.Mock;
  };
  let mockRequest: {
    headers: Record<string, string>;
  };
  let mockHost: ArgumentsHost;

  beforeEach(() => {
    filter = new AllExceptionsFilter();
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      setHeader: jest.fn().mockReturnThis(),
    };
    mockRequest = {
      headers: { 'x-request-id': 'req-test-123' },
    };
    mockHost = {
      switchToHttp: () => ({
        getResponse: () => mockResponse,
        getRequest: () => mockRequest,
      }),
    } as unknown as ArgumentsHost;
  });

  it('should format AppError into standard contract envelope', () => {
    const error = new AppError(ErrorCode.TASK_NOT_FOUND, 'Task not found.');

    filter.catch(error, mockHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: {
        code: ErrorCode.TASK_NOT_FOUND,
        message: 'Task not found.',
        details: undefined,
        requestId: 'req-test-123',
      },
    });
    expect(mockResponse.setHeader).toHaveBeenCalledWith('x-request-id', 'req-test-123');
  });

  it('should mask generic unhandled exceptions with INTERNAL code', () => {
    const genericError = new Error('Secret database password leaked in error');

    filter.catch(genericError, mockHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.objectContaining({
          code: ErrorCode.INTERNAL,
          message: 'Internal server error',
          requestId: 'req-test-123',
        }),
      }),
    );
  });
});
