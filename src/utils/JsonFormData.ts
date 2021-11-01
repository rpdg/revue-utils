export default class JsonFormData {
	form: HTMLFormElement;
	fields!: HTMLFormControlsCollection;

	formData: { [key: string]: any };

	constructor(form: HTMLFormElement) {
		this.form = form;
		this.formData = {};
	}

	get json(): any {
		this.extractValues();
		return this.formData;
	}

	/* Determine what kind of accessor we are dealing with */
	accessorType(key: string | number): string {
		return key === '[]' || (typeof key === 'number' && key % 1 === 0) ? 'array' : 'object';
	}

	/* Perform full evaluation on path and set value */
	putFormData(path: string, value: any, type: string) {
		let self = this,
			accessorRegex = /\[(.*?)]/g,
			matches: RegExpExecArray | null,
			accessors = [],
			firstKeyReg = path.match(/(.+?)\[/),
			firstKey = firstKeyReg ? firstKeyReg[1] : path;

		/* use coerced integer value if we can */
		value = type === 'number' ? parseInt(value, 10) : value;

		while ((matches = accessorRegex.exec(path))) {
			/* If this is blank then we're using array append syntax
         If this is an integer key, save it as an integer rather than a string. */
			let parsedMatch = parseInt(matches[1], 10);
			if (matches[1] === '') {
				accessors.push('[]');
			} else if (parsedMatch === ~~matches[1]) {
				accessors.push(parsedMatch);
			} else {
				accessors.push(matches[1]);
			}
		}

		if (accessors.length > 0) {
			let accessor = accessors[0];
			let accessorType = self.accessorType(accessors[0]);
			let formDataTraverser: any;

			if (typeof self.formData[firstKey] === 'undefined') {
				if (accessorType === 'object') {
					self.formData[firstKey] = {};
				} else {
					self.formData[firstKey] = [];
				}
			} else {
				if (typeof self.formData[firstKey] !== 'object') {
					self.formData[firstKey] = { '': self.formData[firstKey] };
				}
			}

			formDataTraverser = self.formData[firstKey];
			for (let i = 0; i < accessors.length - 1; i++) {
				accessorType = self.accessorType(accessors[i + 1]);
				accessor = accessors[i];

				if (typeof formDataTraverser[accessor] === 'undefined') {
					if (accessorType === 'object') {
						formDataTraverser[accessor] = {};
					} else {
						formDataTraverser[accessor] = [];
					}
				}

				if (typeof formDataTraverser[accessor] !== 'object' && i < accessors.length - 1) {
					formDataTraverser[accessor] = { '': formDataTraverser[accessor] };
				}

				formDataTraverser = formDataTraverser[accessor];
			}

			let finalAccessor = accessors[accessors.length - 1];
			if (finalAccessor === '[]') {
				formDataTraverser.push(value);
			} else if (typeof formDataTraverser[finalAccessor] === 'undefined') {
				formDataTraverser[finalAccessor] = value;
			} else if (formDataTraverser[finalAccessor] instanceof Array) {
				formDataTraverser[finalAccessor].push(value);
			} else {
				formDataTraverser[finalAccessor] = [formDataTraverser[finalAccessor], value];
			}
		} else {
			if (typeof self.formData[firstKey] === 'undefined') {
				self.formData[firstKey] = value;
			} else if (self.formData[firstKey] instanceof Array) {
				self.formData[firstKey].push(value);
			} else {
				self.formData[firstKey] = [self.formData[firstKey], value];
			}
		}
	}

	/* Extract values from form & construct JSONFormData object */
	extractValues() {
		this.fields = this.form.elements;
		[].forEach.call(this.fields, (field: HTMLFormElement, index: number) => {
			let isCheckable = field.type === 'checkbox' || field.type === 'radio';
			let isButton =
				field.type === 'button' ||
				field.type === 'reset' ||
				field.type === 'submit' ||
				field.nodeName.toLowerCase() === 'button';
			if (!isButton && !field.disabled) {
				if (field.type === 'file' && !!field.files.length) {
					this.formData[field.name] = field.files;
					// todo: file upload
					//this.fileToJSON(field.files, field.name);
				} else if (field.type === 'select-multiple') {
					[].forEach.call(field.selectedOptions, (option: HTMLOptionElement) => {
						this.putFormData(field.name + '[]', option.value, field.type);
					});
				} else if (!isCheckable || (isCheckable && field.checked)) {
					this.putFormData(field.name, field.value, field.type);
				}
			}
		});
	}

	/* Read files  */
	fileToJSON(files: FileList, name: string) {
		let self = this,
			filesLn = files.length - 1;

		if (files.length > -1) {
			this.formData[name] = [];
			[].forEach.call(files, function(file: File, index) {
				if (file.size > 5 * 1024 * 1024) {
					throw new Error('One or more files is >5MB');
				} else {
					let fileReader = new FileReader();

					fileReader.readAsDataURL(file);

					fileReader.addEventListener(
						'loadend',
						function() {
							self.formData[name].push({
								type: file.type,
								name: file.name,
								// @ts-ignore
								body: fileReader.result.split('base64,')[1],
							});
						},
						false
					);
				}
			});
		}
	}
}
