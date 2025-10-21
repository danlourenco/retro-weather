import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { withErrorHandling, withGracefulFallback } from './loader';
import { ErrorType, type WeatherError } from '$lib/types/errors';

describe('Loader Utilities', () => {
	// Spy on console methods to verify logging
	let consoleErrorSpy: ReturnType<typeof vi.spyOn>;
	let consoleWarnSpy: ReturnType<typeof vi.spyOn>;

	beforeEach(() => {
		consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
		consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
	});

	afterEach(() => {
		consoleErrorSpy.mockRestore();
		consoleWarnSpy.mockRestore();
	});

	describe('withErrorHandling', () => {
		it('returns data on success', async () => {
			const testData = { id: 1, name: 'Test' };
			const result = await withErrorHandling(async () => testData, 'Test error message');

			expect(result).toEqual({ data: testData });
			expect(result.error).toBeUndefined();
		});

		it('handles string data correctly', async () => {
			const result = await withErrorHandling(async () => 'test string', 'Test error');

			expect(result).toEqual({ data: 'test string' });
		});

		it('handles number data correctly', async () => {
			const result = await withErrorHandling(async () => 42, 'Test error');

			expect(result).toEqual({ data: 42 });
		});

		it('handles array data correctly', async () => {
			const testArray = [1, 2, 3, 4, 5];
			const result = await withErrorHandling(async () => testArray, 'Test error');

			expect(result).toEqual({ data: testArray });
		});

		it('handles null data correctly', async () => {
			const result = await withErrorHandling(async () => null, 'Test error');

			expect(result).toEqual({ data: null });
		});

		it('returns error when function throws', async () => {
			const errorMessage = 'Operation failed';
			const result = await withErrorHandling(async () => {
				throw new Error('Something went wrong');
			}, errorMessage);

			expect(result.data).toBeNull();
			expect(result.error).toBeDefined();
			expect(result.error?.message).toBe(errorMessage);
			expect(result.error?.type).toBe(ErrorType.API_ERROR);
		});

		it('logs error to console', async () => {
			const errorMessage = 'Test operation failed';
			const thrownError = new Error('Internal error');

			await withErrorHandling(async () => {
				throw thrownError;
			}, errorMessage);

			expect(consoleErrorSpy).toHaveBeenCalledWith(errorMessage, thrownError);
		});

		it('preserves WeatherError if thrown', async () => {
			const weatherError: WeatherError = {
				type: ErrorType.NETWORK_ERROR,
				message: 'Network timeout',
				retryable: true,
				statusCode: 504
			};

			const result = await withErrorHandling(async () => {
				throw weatherError;
			}, 'Operation failed');

			expect(result.data).toBeNull();
			expect(result.error).toEqual(weatherError);
		});

		it('handles non-Error objects thrown', async () => {
			const result = await withErrorHandling(async () => {
				throw 'string error'; // eslint-disable-line no-throw-literal
			}, 'Operation failed');

			expect(result.data).toBeNull();
			expect(result.error).toBeDefined();
			expect(result.error?.message).toBe('Operation failed');
		});

		it('handles undefined thrown', async () => {
			const result = await withErrorHandling(async () => {
				throw undefined; // eslint-disable-line no-throw-literal
			}, 'Operation failed');

			expect(result.data).toBeNull();
			expect(result.error).toBeDefined();
		});

		it('handles async operations correctly', async () => {
			const mockAsyncOperation = vi.fn().mockResolvedValue({ data: 'async result' });

			const result = await withErrorHandling(mockAsyncOperation, 'Async failed');

			expect(mockAsyncOperation).toHaveBeenCalledTimes(1);
			expect(result.data).toEqual({ data: 'async result' });
		});

		it('includes error details in result', async () => {
			const originalError = new Error('Original error message');

			const result = await withErrorHandling(async () => {
				throw originalError;
			}, 'Wrapper message');

			expect(result.error?.details).toBe(originalError);
		});
	});

	describe('withGracefulFallback', () => {
		it('returns data on success', async () => {
			const testData = { id: 1, value: 'test' };
			const fallback = { id: 0, value: 'fallback' };
			const result = await withGracefulFallback(
				async () => testData,
				fallback,
				'Warning message'
			);

			expect(result).toEqual(testData);
		});

		it('returns fallback on error', async () => {
			const fallbackData: Record<string, boolean> = { default: true };
			const result = await withGracefulFallback(
				async () => {
					throw new Error('API failed');
				},
				fallbackData,
				'Failed to fetch data'
			);

			expect(result).toEqual(fallbackData);
		});

		it('logs warning (not error) on failure', async () => {
			const warningMessage = 'Optional data failed';
			const thrownError = new Error('API error');

			await withGracefulFallback(
				async () => {
					throw thrownError;
				},
				null,
				warningMessage
			);

			expect(consoleWarnSpy).toHaveBeenCalledWith(warningMessage, thrownError);
			expect(consoleErrorSpy).not.toHaveBeenCalled();
		});

		it('handles empty array fallback', async () => {
			const result = await withGracefulFallback(
				async () => {
					throw new Error('Failed');
				},
				[],
				'Array fetch failed'
			);

			expect(result).toEqual([]);
		});

		it('handles null fallback', async () => {
			const result = await withGracefulFallback(
				async () => {
					throw new Error('Failed');
				},
				null,
				'Null fallback'
			);

			expect(result).toBeNull();
		});

		it('handles undefined fallback', async () => {
			const result = await withGracefulFallback(
				async () => {
					throw new Error('Failed');
				},
				undefined,
				'Undefined fallback'
			);

			expect(result).toBeUndefined();
		});

		it('handles string fallback', async () => {
			const result = await withGracefulFallback(
				async () => {
					throw new Error('Failed');
				},
				'default value',
				'String fallback'
			);

			expect(result).toBe('default value');
		});

		it('handles number fallback', async () => {
			const result = await withGracefulFallback(
				async () => {
					throw new Error('Failed');
				},
				0,
				'Number fallback'
			);

			expect(result).toBe(0);
		});

		it('does not throw error (graceful handling)', async () => {
			await expect(
				withGracefulFallback(
					async () => {
						throw new Error('Critical error');
					},
					null,
					'Should not throw'
				)
			).resolves.toBeNull();
		});

		it('handles successful async operations', async () => {
			const mockAsyncOperation = vi.fn().mockResolvedValue(['item1', 'item2']);

			const result = await withGracefulFallback(mockAsyncOperation, [], 'Async failed');

			expect(mockAsyncOperation).toHaveBeenCalledTimes(1);
			expect(result).toEqual(['item1', 'item2']);
		});

		it('handles non-Error objects gracefully', async () => {
			const result = await withGracefulFallback(
				async () => {
					throw { custom: 'error object' }; // eslint-disable-line no-throw-literal
				},
				{ default: true },
				'Custom error'
			);

			expect(result).toEqual({ default: true });
		});
	});

	describe('Integration scenarios', () => {
		it('handles nested withGracefulFallback calls', async () => {
			const result = await withGracefulFallback(
				async () => {
					const nested = await withGracefulFallback(
						async () => {
							throw new Error('Inner error');
						},
						'nested fallback',
						'Nested failed'
					);
					return { nested };
				},
				{ nested: 'outer fallback' },
				'Outer failed'
			);

			expect(result).toEqual({ nested: 'nested fallback' });
			expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
		});

		it('handles withGracefulFallback inside withErrorHandling', async () => {
			const result = await withErrorHandling(async () => {
				const optional = await withGracefulFallback(
					async () => {
						throw new Error('Optional failed');
					},
					null,
					'Optional data failed'
				);

				return {
					required: 'data',
					optional
				};
			}, 'Critical operation failed');

			expect(result.data).toEqual({
				required: 'data',
				optional: null
			});
			expect(consoleWarnSpy).toHaveBeenCalledWith('Optional data failed', expect.any(Error));
		});

		it('handles multiple withGracefulFallback calls in sequence', async () => {
			const first = await withGracefulFallback(
				async () => {
					throw new Error('First failed');
				},
				1,
				'First failed'
			);

			const second = await withGracefulFallback(async () => 2, 0, 'Second failed');

			const third = await withGracefulFallback(
				async () => {
					throw new Error('Third failed');
				},
				3,
				'Third failed'
			);

			expect([first, second, third]).toEqual([1, 2, 3]);
			expect(consoleWarnSpy).toHaveBeenCalledTimes(2);
		});

		it('realistic weather loader scenario', async () => {
			// Simulate a realistic weather data loader
			const mockGetLocation = vi.fn().mockResolvedValue({
				gridId: 'BOX',
				gridX: 64,
				gridY: 77
			});

			const mockGetStations = vi.fn().mockResolvedValue([
				{ id: 'KBOS', name: 'Boston' }
			]);

			const mockGetObservation = vi.fn().mockRejectedValue(new Error('Observation unavailable'));

			const mockGetAlerts = vi.fn().mockRejectedValue(new Error('Alerts service down'));

			const result = await withErrorHandling(async () => {
				const location = await mockGetLocation();
				const stations = await mockGetStations(location.gridId, location.gridX, location.gridY);

				const observation = await withGracefulFallback(
					() => mockGetObservation(stations[0].id),
					null,
					'Failed to fetch observation'
				);

				const alerts = await withGracefulFallback(
					() => mockGetAlerts(),
					[],
					'Failed to fetch alerts'
				);

				return {
					location,
					stations,
					observation,
					alerts
				};
			}, 'Failed to load weather data');

			expect(result.data).toEqual({
				location: { gridId: 'BOX', gridX: 64, gridY: 77 },
				stations: [{ id: 'KBOS', name: 'Boston' }],
				observation: null,
				alerts: []
			});

			expect(consoleWarnSpy).toHaveBeenCalledTimes(2);
			expect(consoleErrorSpy).not.toHaveBeenCalled();
		});
	});

	describe('Type safety', () => {
		it('preserves complex type structures', async () => {
			interface ComplexType {
				id: number;
				nested: {
					array: string[];
					optional?: boolean;
				};
			}

			const complexData: ComplexType = {
				id: 1,
				nested: {
					array: ['a', 'b', 'c'],
					optional: true
				}
			};

			const result = await withErrorHandling(async () => complexData, 'Test');

			expect(result.data).toEqual(complexData);
			// TypeScript should infer correct type
			if (result.data) {
				expect(result.data.nested.array).toHaveLength(3);
			}
		});

		it('handles generic array types', async () => {
			type Station = { id: string; name: string };
			const stations: Station[] = [
				{ id: 'KBOS', name: 'Boston' },
				{ id: 'KPWM', name: 'Portland' }
			];

			const result = await withGracefulFallback(async () => stations, [], 'Failed');

			expect(result).toHaveLength(2);
			expect(result[0].id).toBe('KBOS');
		});
	});
});
