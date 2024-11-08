/**
 * Channel<T> 类实现了类似 Go 中的 chan T
 * @example
async function producer(ch: Channel<number>) {
  for (let i = 0; i < 5; i++) {
    console.log(`Producing: ${i}`);
    await ch.send(i);
	console.log(`Produced: ${i}`);
    await new Promise(resolve => setTimeout(resolve, 1000)); // 模拟生产间隔
  }
  ch.close(); // 生产完毕后关闭 channel
}

async function consumer(ch: Channel<number>) {
  while (true) {
    const item = await ch.receive();
    if (item === undefined) {
      console.log("Channel closed, stopping consumer.");
      break;
    }
    console.log(`Consuming: ${item}`);
	await new Promise(resolve => setTimeout(resolve, 500)); // 模拟消费间隔
  }
}

const ch = new Channel<number>(2); // 设置 channel 容量为 2

// 启动生产者和消费者
producer(ch);
consumer(ch);
 */
export class Channel<T> {
	private buffer: T[] = [];
	private resolvers: ((value: T | PromiseLike<T>) => void)[] = [];
	private closed = false;
	private readonly capacity: number;
	private waitingSends: ((value: void) => void)[] = [];

	constructor(capacity: number = 0) {
		this.capacity = capacity;
	}

	// 发送数据到 channel
	async send(value: T): Promise<void> {
		if (this.closed) {
			throw new Error('Cannot send on closed channel');
		}

		// 若队列未满，直接入队
		if (this.buffer.length < this.capacity) {
			this.buffer.push(value);

			// 如果有等待的接收方，立即触发
			if (this.resolvers.length > 0) {
				const resolver = this.resolvers.shift();
				if (resolver) {
					resolver(this.buffer.shift()!);
				}
			}
		} else {
			// 队列满了，等待空位
			await new Promise<void>((resolve) => this.waitingSends.push(resolve));
			this.buffer.push(value);
		}
	}

	// 从 channel 接收数据
	async receive(): Promise<T | undefined> {
		if (this.buffer.length > 0) {
			// 有数据可接收，直接返回
			const value = this.buffer.shift();

			// 如果有等待的发送方，触发下一个 send 操作
			if (this.waitingSends.length > 0) {
				const sender = this.waitingSends.shift();
				if (sender) {
					sender();
				}
			}

			return value;
		} else if (this.closed) {
			return undefined;
		} else {
			// 没有数据可接收，等待数据
			return new Promise<T>((resolver) => this.resolvers.push(resolver));
		}
	}

	// 关闭 channel
	close() {
		this.closed = true;
		// 通知所有等待的接收方
		while (this.resolvers.length > 0) {
			const resolver = this.resolvers.shift();
			if (resolver) {
				resolver(undefined as T);
			}
		}

		// 通知所有等待的发送方
		while (this.waitingSends.length > 0) {
			const sender = this.waitingSends.shift();
			if (sender) {
				sender();
			}
		}
	}
}

/**
 * select 函数模拟了 Go 中 select 的多路复用特性
 *  @example
 async function producer(ch1: Channel<number>, ch2: Channel<number>) {
  for (let i = 0; i < 3; i++) {
    console.log(`Producer producing: ${i}`);
    await ch1.send(i);
    await ch2.send(i);
    await new Promise(resolve => setTimeout(resolve, 1000)); // 模拟生产间隔
  }
  ch1.close();
  ch2.close();
}

async function consumer(ch1: Channel<number>, ch2: Channel<number>) {
  while (true) {
    const result = await select([ch1, ch2]);

    if (result.value === undefined) {
      console.log("Channel closed, stopping consumer.");
      break;
    }

    console.log(`Received from channel: ${result.value}`);
  }
}

const ch1 = new Channel<number>(1);
const ch2 = new Channel<number>(1);

producer(ch1, 1);
producer(ch2, 2);
consumer(ch1, ch2);
 */
export async function select<T>(options: Channel<T>[]): Promise<{ channel: Channel<T>; value: T | undefined }> {
	const promises = options.map((channel) =>
		channel.receive().then((value) => ({
			channel,
			value,
		}))
	);

	// 使用 Promise.race 等待第一个完成的操作
	return Promise.race(promises);
}
