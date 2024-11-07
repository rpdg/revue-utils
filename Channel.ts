/**
 * @example
async function producer(ch: Channel<number>) {
  for (let i = 0; i < 5; i++) {
    console.log(`Producing: ${i}`);
    ch.send(i);
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
  }
}

const ch = new Channel<number>();

// 启动生产者和消费者
producer(ch);
consumer(ch);
 */
class Channel<T> {
	private queue: T[] = [];
	private resolvers: ((value: T | PromiseLike<T>) => void)[] = [];
	private closed = false;

	// 发送数据到 channel
	send(value: T) {
		if (this.closed) {
			throw new Error('Cannot send on closed channel');
		}

		if (this.resolvers.length > 0) {
			const resolve = this.resolvers.shift();
			if (resolve) {
				resolve(value);
			}
		} else {
			this.queue.push(value);
		}
	}

	// 从 channel 接收数据
	async receive(): Promise<T | undefined> {
		if (this.queue.length > 0) {
			return this.queue.shift();
		} else if (this.closed) {
			return undefined;
		} else {
			return new Promise<T>((resolve) => this.resolvers.push(resolve));
		}
	}

	// 关闭 channel
	close() {
		this.closed = true;
		while (this.resolvers.length > 0) {
			const resolve = this.resolvers.shift();
			if (resolve) {
				resolve(undefined as T);
			}
		}
	}
}
